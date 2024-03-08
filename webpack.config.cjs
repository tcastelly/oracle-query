const path = require('path');

module.exports = {
  target: 'node',
  context: __dirname,
  entry: {
    index: './src/index.ts',
  },
  // un-comment to generate source-map in the build
  // devtool: 'eval-source-map',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
    chunkFormat: 'module'
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env'],
          },
        },
      },
    ],
  },
};
