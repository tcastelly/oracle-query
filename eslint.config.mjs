import path from 'node:path';
import parser from '@typescript-eslint/parser';
import { includeIgnoreFile } from '@eslint/config-helpers';
import js from '@eslint/js';
import { configs, plugins, rules } from 'eslint-config-airbnb-extended';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import tcyPlugin from '@tcy/eslint-rules/back';
import tcyRecommendedRules from '@tcy/eslint-rules/back/recommended';

const gitignorePath = path.resolve('.', '.gitignore');

const defaultConfig = [
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,jsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        tsconfigRootDir: path.resolve('.'),
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
  },
];

const jsConfig = [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
];

const nodeConfig = [
  plugins.node,
  ...configs.node.recommended,
];

const typescriptConfig = [
  ...configs.base.typescript,
  tcyPlugin,

  // custom rules
  {
    files: ['**/*.+(ts|tsx|mts|cts)'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    languageOptions: {
      parser,
      parserOptions: {
        tsconfigRootDir: path.resolve('.'),
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      ...tcyRecommendedRules,
      ...rules.typescript.typescriptEslintStrict.rules,
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@stylistic/max-len': [2, 150, 4],
      'no-underscore-dangle': 'off',
    },
  },

  // specific rules for node scripts
  {
    files: ['scripts/**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'import-x/extensions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    },
  },

  // specific rules for custom types
  {
    files: ['**/*.d.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-shadow': 'off',
    },
  },

  // specific rules for db framework
  {
    files: [
      'src/_base/dto/*.ts',
      'src/db.ts',
      'src/createQuery.ts',
      'src/backend.ts',
    ],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-param-reassign': 'off',
      'max-classes-per-file': 'off',
    },
  },

  // specific rules for DTOs
  {
    files: ['**/**/*Dto.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-classes-per-file': 'off',
    },
  },

  // tests overrides
  {
    files: ['tests/**', '**/__mocks__/**/*.js'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'max-classes-per-file': 'off',
      'no-undef': 'off',
      'import-x/extensions': 'off',
      'import-x/no-unresolved': 'off',
      '@stylistic/max-len': [2, 150, 4],
      'no-underscore-dangle': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  {
    files: ['eslint.config.mjs'],
    rules: {},
  },

  {
    ignores: ['dist/**', 'node_modules/**', 'tests/unit/*.js'],
  },
];

export default [
  includeIgnoreFile(gitignorePath),
  ...defaultConfig,
  ...jsConfig,
  ...nodeConfig,
  ...typescriptConfig,
];
