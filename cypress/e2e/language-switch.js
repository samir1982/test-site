const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");
const { NAVIGATION_SELECTORS } = require("../support/selectors/navigation.selectors");

function normalizePath(pathname) {
  return pathname.replace(/\.html$/, "").replace(/\/$/, "");
}

function languageLabel(lang) {
  return lang.toLowerCase() === "en" ? "EN" : "FR";
}

function getAllowedHostnames() {
  return ["www.nbc.ca"];
}

function getExpectedPathHints(lang) {
  if (lang === "fr") {
    return ["/fr/entreprises", "/fr"];
  }

  return ["/en/business", "/en"];
}

function getLanguageTextMarkers(lang) {
  if (lang === "fr") {
    return [
      "entreprises",
      "vous etes",
      "solutions",
      "banque nationale"
    ];
  }

  return [
    "business",
    "you are",
    "solutions",
    "national bank"
  ];
}

function assertLanguageState(expectedLang) {
  const expectedPathHints = getExpectedPathHints(expectedLang);
  const allowedHostnames = getAllowedHostnames();

  cy.location("hostname", { timeout: 30000 }).should((hostname) => {
    expect(allowedHostnames, "host cible autorise").to.include(hostname);
  });

  cy.location("pathname", { timeout: 30000 }).should((pathname) => {
    const normalized = normalizePath(pathname);
    const matches = expectedPathHints.some((hint) => {
      if (hint === "/") {
        return normalized === "" || normalized === "/";
      }

      return normalized.includes(hint);
    });

    expect(matches, `pathname valide pour ${expectedLang}`).to.equal(true);
  });
}

function assertTargetLanguageTextVisible(expectedLang) {
  const markers = getLanguageTextMarkers(expectedLang);

  cy.get("body", { timeout: 30000 })
    .should("be.visible")
    .invoke("text")
    .then((text) => {
      const normalizedText = (text || "").toLowerCase();
      const hasMarker = markers.some((marker) => normalizedText.includes(marker));

      expect(hasMarker, `texte visible en ${expectedLang}`).to.equal(true);
    });
}

function findBestSwitchLink(links, currentOrigin, targetUrl, toLang) {
  const expectedPathPart = toLang === "en" ? "/en/business" : "/fr/entreprises";

  const scored = links
    .map((link) => {
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").trim().toLowerCase();
      const langAttr = (link.getAttribute("lang") || "").trim().toLowerCase();
      const hreflang = (link.getAttribute("hreflang") || "").trim().toLowerCase();

      let parsed;

      try {
        parsed = new URL(href, currentOrigin);
      } catch {
        return null;
      }

      let score = 0;

      if (normalizePath(parsed.pathname).includes(expectedPathPart)) {
        score += 5;
      }

      if (parsed.hostname.toLowerCase() === targetUrl.hostname.toLowerCase()) {
        score += 3;
      }

      if (text === toLang || text.includes(languageLabel(toLang).toLowerCase())) {
        score += 3;
      }

      if (langAttr === toLang || hreflang === toLang) {
        score += 2;
      }

      return { link, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 && scored[0].score > 0 ? scored[0].link : null;
}

function getDevicesConfig() {
  return Cypress.env("devices") || {};
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

const state = {
  envName: "prod",
  envUrls: null,
  selectedEnv: null,
  requestedLang: null,
  requestedDevice: "desktop",
  fromUrl: null,
  targetUrl: null
};

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

function validateDevice(device) {
  const normalizedDevice = (device || "").toLowerCase().trim();
  const devices = getDevicesConfig();

  if (!Object.prototype.hasOwnProperty.call(devices, normalizedDevice)) {
    const allowed = Object.keys(devices).join(", ") || "desktop, mobile";
    throw new Error(`Valeur invalide pour device: ${device}. Utilise ${allowed}.`);
  }

  return normalizedDevice;
}

Given("je teste l'environnement {string}", (envName) => {
  if (envName.toLowerCase() !== "prod") {
    throw new Error("Ce projet est configure uniquement pour prod.");
  }

  const requestedLang = (Cypress.env("lang") || "").toLowerCase().trim();
  if (requestedLang && requestedLang !== "fr" && requestedLang !== "en") {
    throw new Error(`Valeur invalide pour lang: ${requestedLang}. Utilise fr ou en.`);
  }

  const requestedDevice = validateDevice(Cypress.env("device") || "desktop");

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
});

Given("j'utilise le device {string}", (device) => {
  const envDevice = (Cypress.env("device") || "").toLowerCase().trim();

  if (envDevice) {
    state.requestedDevice = validateDevice(envDevice);
    return;
  }

  state.requestedDevice = validateDevice(device);
});

Given("j'ouvre la page {string}", function (fromLang) {
  if (state.requestedLang && fromLang.toLowerCase() !== state.requestedLang) {
    this.skip();
  }

  state.fromUrl = state.selectedEnv[fromLang];

  if (!state.fromUrl) {
    throw new Error(`Langue de depart inconnue: ${fromLang}`);
  }

  applyViewportFromDevice(state.requestedDevice);
  cy.visit(state.fromUrl, { failOnStatusCode: false });
  assertLanguageState(fromLang);
});

When("je clique sur le switch vers {string}", (toLang) => {
  const toUrl = state.selectedEnv[toLang];

  if (!toUrl) {
    throw new Error(`Langue cible inconnue: ${toLang}`);
  }

  state.targetUrl = new URL(toUrl);

  openMobileMenuIfNeeded();

  cy.get("body").then(($body) => {
    if (state.requestedDevice === "mobile") {
      const mobileSwitchSelector = NAVIGATION_SELECTORS.mobileMenu.switchByLang.replace("{lang}", toLang);
      const mobileSwitch = $body.find(mobileSwitchSelector).filter(":visible").first();

      if (mobileSwitch.length > 0) {
        cy.wrap(mobileSwitch)
          .scrollIntoView({ easing: "linear", duration: 300 })
          .should("be.visible")
          .invoke("removeAttr", "target")
          .click({ force: true });
        return;
      }
    }

    cy.window().then((win) => {
      const currentOrigin = win.location.origin;

      cy.get("a[href]", { timeout: 30000 }).then(($links) => {
        const link = findBestSwitchLink(Array.from($links), currentOrigin, state.targetUrl, toLang);

        expect(link, "switch de langue trouve").to.not.equal(null);
        cy.wrap(link).invoke("removeAttr", "target").click({ force: true });
      });
    });
  });
});

Then("je suis redirige vers la page {string}", (toLang) => {
  assertLanguageState(toLang);
  assertTargetLanguageTextVisible(toLang);
});
