const SEARCH_SELECTORS = {
  openSearchButton: [
    "button[aria-label*='search']",
    "button[aria-label*='Search']",
    "button[aria-label*='recherche']",
    "button[aria-label*='Recherche']",
    "[data-testid*='search']",
    "[data-testid*='Search']"
  ],
  searchInput: [
    "input[type='search']",
    "input[name*='search']",
    "input[name*='Search']",
    "input[placeholder*='Search']",
    "input[placeholder*='search']",
    "input[placeholder*='Recherche']",
    "input[placeholder*='recherche']"
  ],
  submitSearchButton: [
    "button[type='submit']",
    "button[aria-label*='search']",
    "button[aria-label*='Search']",
    "button[aria-label*='recherche']",
    "button[aria-label*='Recherche']"
  ],
  resultItem: [
    "main a[href]",
    ".search-results a[href]"
  ]
};

const SEARCH_TEST_DATA = {
  defaultKeywordFr: "quebec"
};

module.exports = {
  SEARCH_SELECTORS,
  SEARCH_TEST_DATA
};
