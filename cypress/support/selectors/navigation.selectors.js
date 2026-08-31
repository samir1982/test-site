const NAVIGATION_SELECTORS = {
  mobileMenu: {
    openMenuSvg: [
      "svg[aria-label='Open Menu']",
      "svg[aria-label='Ouverture du menu']",
      "svg[aria-label*='menu']",
      "svg[aria-label*='Menu']"
    ],
    fallbackButtons: [
      "button[aria-label*='menu' i]",
      "button[aria-controls*='menu' i]",
      "button[class*='menu' i]",
      "button[id*='menu' i]",
      "[data-testid*='menu' i]"
    ],
    switchByLang: "a[data-language-selector][lang='{lang}'].cmp-nav-mobile__step-label"
  }
};

module.exports = {
  NAVIGATION_SELECTORS
};
