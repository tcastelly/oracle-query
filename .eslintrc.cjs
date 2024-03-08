module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    jest: true,
    node: true,
    browser: true,
  },
  rules: {
    camelcase: [
      'error', {
        // allow underscore for query builder
        // e.g: pnumDskId: function pkgApiPl_allDesksId() {}
        allow: ['^pkgApi[a-zA-Z]*_'],
        properties: 'never',
      },
    ],
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
    '@typescript-eslint/no-unused-vars': ['error'],

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

    'no-unused-vars': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        project: '.',
      },
    },
  },
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    typescript: {
      // use a glob pattern
      project: './tsconfig.json',
    },
  },
};
