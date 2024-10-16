import globals from 'globals';
import jest from 'eslint-plugin-jest';
import importPlugin from 'eslint-plugin-import';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import tsParser from '@typescript-eslint/parser';

// mimic CommonJS variables -- not needed if using CommonJS
const __dirname = path.dirname(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

export default [
  ...compat.config({
    extends: ['airbnb-base'],
    rules: {
      // fix airbnb conflicts
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
    },
  }),
  {
    files: ['**/*.+(ts|tsx|mts|cts|js|mjs|cjs|jsx)'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'func-names': 0,
      'no-underscore-dangle': 0,
      'no-param-reassign': 0,
      'max-len': [2, 150, 4],
      'max-classes-per-file': 0,
      'space-before-function-paren': 0,

      // controller have to be prototyped
      'class-methods-use-this': 0,

      // use for constructor dto
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-empty-interface': 0,

      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-this-alias': 0,
      '@typescript-eslint/no-empty-function': 0,

      // fix empty constructor in @Dto classes
      '@typescript-eslint/no-unsafe-declaration-merging': 0,
      'no-empty-function': 0,

      // fix export/import default
      'import/no-named-as-default': 0,

      // fix airbnb conflicts
      'import/extensions': 'off',
      'import/no-unresolved': 'off',

      // fix try/catch unused (e)
      '@typescript-eslint/no-unused-vars': [
        'error', {
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      'no-unused-vars': 'off',
    },
    settings: {
      ...importPlugin.configs.typescript.settings,
      'import/resolver': {
        ...importPlugin.configs.typescript.settings['import/resolver'],
      },
    },
  },
  {
    files: ['scripts/*.+(ts|tsx|mts|cts|js|mjs|cjs|jsx)'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-var-requires': 0,
      'no-console': 0
    },
  },
  {
    files: ['tests/**', '**/__mocks__/**/*.js'],
    ...jest.configs['flat/recommended'],
    rules: {
      'jest/no-conditional-expect': 'off',
      camelcase: [
        'error', {
          // allow underscore for query builder
          // e.g: pnumDskId: function pkgApiPl_allDesksId() {}
          allow: ['^pkgApi[a-zA-Z]*_'],
          properties: 'never',
        },
      ],
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    ignores: ['**/eslint.config.mjs'],
  },
];
