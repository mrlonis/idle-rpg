// @ts-check
const { defineConfig, globalIgnores } = require('eslint/config');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const importPlugin = require('eslint-plugin-import');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const eslintConfigPrettier = require('eslint-config-prettier');
const path = require('node:path');
const coreBoundary = require('./src/core/eslint.config.js');

module.exports = defineConfig([
  globalIgnores([
    '.angular/',
    '.codacy/',
    '.github/instructions/',
    '.husky/',
    '.idea/',
    'coverage/',
    'dist/',
    'node_modules/',
    'playwright-report/',
    'test-results/',
    'package-lock.json',
    // Generated agent instruction files (source of truth: AGENTS.md)
    '.claude/CLAUDE.md',
    '.gemini/GEMINI.md',
    '.github/copilot-instructions.md',
    '.junie/guidelines.md',
    '.windsurf/rules/guidelines.md',
    '.cursor/rules/cursor.mdc',
  ]),
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: path.join(__dirname, 'tsconfig.json'),
        },
      },
    },
    languageOptions: { parserOptions: { projectService: true } },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/computed-must-return': 'error',
      '@angular-eslint/consistent-component-styles': 'error',
      '@angular-eslint/contextual-decorator': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-developer-preview': 'error',
      '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-experimental': 'error',
      '@angular-eslint/no-forward-ref': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/no-pipe-impure': 'error',
      '@angular-eslint/no-queries-metadata-property': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/require-lifecycle-on-prototype': 'error',
      '@angular-eslint/sort-keys-in-type-decorator': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'error',
      '@angular-eslint/use-injectable-provided-in': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-absolute-path': 'error',
      'import/no-cycle': 'error',
      'import/no-deprecated': 'error',
      'import/no-extraneous-dependencies': ['error'],
      'import/no-self-import': 'error',
      'import/no-unresolved': 'error',
      'import/no-useless-path-segments': ['error', { noUselessIndex: true, commonjs: true }],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: false },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
  // The core/ boundary. Placed after the shared TypeScript config so its restrictions win.
  ...coreBoundary,
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
]);
