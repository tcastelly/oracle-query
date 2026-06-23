module.exports = {
  '*.js': [
    'eslint --fix',
  ],
  '*.{ts,tsx}': [
    () => 'tsgo --skipLibCheck --noEmit',
    'eslint --cache --fix',
  ],
};
