const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const {
  addCucumberPreprocessorPlugin
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  createEsbuildPlugin
} = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  video: false,
  e2e: {
    specPattern: "cypress/e2e/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)]
        })
      );

      return config;
    },
    env: {
      targetEnv: "prod",
      device: "desktop",
      urls: {
        prod: {
          fr: "https://www.nbc.ca/fr/entreprises.html",
          en: "https://www.nbc.ca/en/business.html"
        }
      },
      devices: {
        desktop: {
          width: 1440,
          height: 900
        },
        mobile: {
          preset: "iphone-x"
        }
      }
    }
  }
});
