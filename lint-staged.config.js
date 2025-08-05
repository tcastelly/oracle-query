module.exports = {
  '*.js': [
    'eslint --fix',
  ],
  '*.{ts,tsx}': [
    () => 'tsc --skipLibCheck --noEmit',
    'eslint --cache --fix',
  ],
};
