const { CONSENT_SELECTORS } = require("./selectors/consent.selectors");

Cypress.on("uncaught:exception", () => {
  // Ignore third-party runtime exceptions from target sites.
  return false;
});

function clickFirstIfExists(doc, selectors) {
  for (const selector of selectors) {
    const el = doc.querySelector(selector);
    if (el) {
      el.click();
      return true;
    }
  }

  return false;
}

Cypress.Commands.overwrite("visit", (originalFn, ...args) => {
  return originalFn(...args).then((win) => {
    const doc = win.document;

    clickFirstIfExists(doc, CONSENT_SELECTORS.oneTrustAccept);
    clickFirstIfExists(doc, CONSENT_SELECTORS.didomiAccept);

    return win;
  });
});
