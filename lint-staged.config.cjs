module.exports = {
  '*.js': [
    'eslint --fix',
  ],
  '*.{ts,tsx}': [
    () => 'node_modules/typescript7/bin/tsc --skipLibCheck --noEmit',
    'eslint --cache --fix',
  ],
};
