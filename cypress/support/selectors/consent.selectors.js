const CONSENT_SELECTORS = {
  oneTrustAccept: ["#onetrust-accept-btn-handler"],
  didomiAccept: [
    "#didomi-notice-agree-button",
    "button[id*='didomi-notice-agree-button']",
    "button.didomi-components-button.didomi-button.didomi-components-button--color",
    "button[data-testid='didomi-notice-agree-button']"
  ]
};

module.exports = {
  CONSENT_SELECTORS
};
