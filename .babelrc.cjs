const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  sourceMap: 'inline',
  presets: [
    [require.resolve('@babel/preset-env'), {
      targets:
        isProduction ? 'last 2 versions' : { node: 'current' },
    }],
    [require.resolve('@babel/preset-typescript')],
  ],
  plugins: [
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true, }],
    [require.resolve('@babel/plugin-proposal-class-properties')],
    [require.resolve('babel-plugin-module-resolver'), {
      root: ["./src/"],
      alias: {
        "@": "./src"
      },
    }],
  ],
};
