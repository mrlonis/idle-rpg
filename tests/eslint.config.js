// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../eslint.config.js');
const playwright = require('eslint-plugin-playwright');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {},
  },
]);
