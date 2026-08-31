const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
const { NAVIGATION_SELECTORS } = require("../support/selectors/navigation.selectors");
const { SEARCH_SELECTORS } = require("../support/selectors/search.selectors");

const state = {
  envName: "prod",
  envUrls: null,
  selectedEnv: null,
  requestedLang: null,
  requestedDevice: "desktop",
  requestedKeyword: "",
  activeLang: "fr",
  activeKeyword: "",
  searchResultFound: false
};

function getDevicesConfig() {
  return Cypress.env("devices") || {};
}

function validateDevice(device) {
  const normalizedDevice = (device || "").toLowerCase().trim();
  const devices = getDevicesConfig();

  if (!Object.prototype.hasOwnProperty.call(devices, normalizedDevice)) {
    const allowed = Object.keys(devices).join(", ") || "desktop, mobile";
    throw new Error(`Valeur invalide pour device: ${device}. Utilise ${allowed}.`);
  }

  return normalizedDevice;
}

function applyViewportFromDevice(device) {
  const devices = getDevicesConfig();
  const deviceConfig = devices[device];

  if (!deviceConfig) {
    throw new Error(`Configuration introuvable pour device: ${device}`);
  }

  if (deviceConfig.preset) {
    cy.viewport(deviceConfig.preset);
    return;
  }

  const width = Number(deviceConfig.width);
  const height = Number(deviceConfig.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Configuration viewport invalide pour device: ${device}`);
  }

  cy.viewport(width, height);
}

function clickFirstVisibleInBody(selectors, options = { force: true, failIfNotFound: true }) {
  cy.get("body").then(($body) => {
    const match = selectors
      .map((selector) => $body.find(selector).filter(":visible").first())
      .find(($el) => $el && $el.length > 0);

    if ((!match || match.length === 0) && options.failIfNotFound !== false) {
      throw new Error(`Aucun element visible trouve pour selectors: ${selectors.join(" | ")}`);
    }

    if (!match || match.length === 0) {
      return;
    }

    cy.wrap(match).click(options);
  });
}

function hasVisibleSearchInput() {
  return cy.get("body").then(($body) => {
    const match = SEARCH_SELECTORS.searchInput
      .map((selector) => $body.find(selector).filter(":visible").first())
      .find(($el) => $el && $el.length > 0);

    return Boolean(match && match.length > 0);
  });
}

function openSearchFromTextFallback() {
  cy.contains("a,button", /recherche|search/i, { timeout: 6000 })
    .filter(":visible")
    .first()
    .click({ force: true });
}

function scrollMobileMenuIfNeeded() {
  if (state.requestedDevice !== "mobile") {
    return;
  }

  cy.get("body").then(($body) => {
    const panel = $body.find("[class*='cmp-nav-mobile']:visible").first();

    if (panel.length > 0) {
      cy.wrap(panel).scrollTo("bottom", { ensureScrollable: false });
      return;
    }

    cy.scrollTo("bottom", { ensureScrollable: false });
  });
}

function openMobileMenuIfNeeded() {
  if (state.requestedDevice !== "mobile") {
    return;
  }

  cy.get("body").then(($body) => {
    const openMenuSvg = $body.find(NAVIGATION_SELECTORS.mobileMenu.openMenuSvg.join(", ")).first();

    if (openMenuSvg.length > 0) {
      const clickableParent = openMenuSvg.closest("button, a, [role='button']");

      if (clickableParent.length > 0) {
        cy.wrap(clickableParent).click({ force: true });
        return;
      }

      cy.wrap(openMenuSvg).click({ force: true });
      return;
    }

    const menuButton = NAVIGATION_SELECTORS.mobileMenu.fallbackButtons
      .map((selector) => $body.find(selector).filter(":visible").first())
      .find(($el) => $el && $el.length > 0);

    if (menuButton && menuButton.length > 0) {
      cy.wrap(menuButton).click({ force: true });
    }
  });
}

Given("je prepare le test de recherche sur {string}", (envName) => {
  if (envName.toLowerCase() !== "prod") {
    throw new Error("Ce projet est configure uniquement pour prod.");
  }

  const requestedLang = (Cypress.env("lang") || "").toLowerCase().trim();
  if (requestedLang && requestedLang !== "fr" && requestedLang !== "en") {
    throw new Error(`Valeur invalide pour lang: ${requestedLang}. Utilise fr ou en.`);
  }

  const requestedDevice = validateDevice(Cypress.env("device") || "desktop");
  const requestedKeyword = (Cypress.env("keyword") || "").toLowerCase().trim();
  const envUrls = Cypress.env("urls");
  const selectedEnv = envUrls?.[envName];

  if (!selectedEnv) {
    throw new Error(`Environnement inconnu: ${envName}`);
  }

  state.envName = envName;
  state.envUrls = envUrls;
  state.selectedEnv = selectedEnv;
  state.requestedLang = requestedLang;
  state.requestedDevice = requestedDevice;
  state.requestedKeyword = requestedKeyword;
  state.searchResultFound = false;
});

Given("je choisis le device de recherche {string}", (device) => {
  const envDevice = (Cypress.env("device") || "").toLowerCase().trim();

  if (envDevice) {
    state.requestedDevice = validateDevice(envDevice);
    return;
  }

  state.requestedDevice = validateDevice(device);
});

Given("je suis sur la page de recherche {string}", function (lang) {
  const normalizedLang = lang.toLowerCase();

  if (state.requestedLang && normalizedLang !== state.requestedLang) {
    this.skip();
  }

  const url = state.selectedEnv[normalizedLang];

  if (!url) {
    throw new Error(`Langue non configuree pour la recherche: ${lang}`);
  }

  state.activeLang = normalizedLang;

  applyViewportFromDevice(state.requestedDevice);
  cy.visit(url, { failOnStatusCode: false });
  cy.location("pathname", { timeout: 30000 }).should("include", normalizedLang === "fr" ? "/fr" : "/en");
});

When("j'ouvre la recherche depuis le menu si necessaire", () => {
  openMobileMenuIfNeeded();

  hasVisibleSearchInput().then((visible) => {
    if (visible) {
      return;
    }

    scrollMobileMenuIfNeeded();
    clickFirstVisibleInBody(SEARCH_SELECTORS.openSearchButton, { force: true, failIfNotFound: false });

    hasVisibleSearchInput().then((visibleAfterButtonClick) => {
      if (visibleAfterButtonClick) {
        return;
      }

      openSearchFromTextFallback();
    });
  });
});

When("je recherche le mot {string}", (keyword) => {
  const effectiveKeyword = state.requestedKeyword || keyword;
  state.activeKeyword = effectiveKeyword;

  cy.get("body").then(($body) => {
    const inputMatch = SEARCH_SELECTORS.searchInput
      .map((selector) => $body.find(selector).filter(":visible").first())
      .find(($el) => $el && $el.length > 0);

    if (!inputMatch || inputMatch.length === 0) {
      throw new Error("Champ de recherche introuvable.");
    }

    cy.wrap(inputMatch)
      .clear({ force: true })
      .type(effectiveKeyword, { delay: 20, force: true })
      .type("{enter}", { force: true });
  });
});

Then("je vois des resultats de recherche", () => {
  cy.get("body", { timeout: 30000 }).then(($body) => {
    const match = SEARCH_SELECTORS.resultItem
      .map((selector) => $body.find(selector).filter(":visible").first())
      .find(($el) => $el && $el.length > 0);

    expect(match && match.length > 0, "resultat de recherche visible").to.equal(true);
    state.searchResultFound = true;
  });
});

Then("je vois le mot {string} dans la page de resultats", (keyword) => {
  const expected = (state.requestedKeyword || keyword || state.activeKeyword || "").toLowerCase();

  cy.get("body", { timeout: 30000 })
    .invoke("text")
    .then((text) => {
      const normalizedText = (text || "").toLowerCase();
      expect(normalizedText.includes(expected), `mot ${expected} visible dans la page`).to.equal(true);
    });
});
