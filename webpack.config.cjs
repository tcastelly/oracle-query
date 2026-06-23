// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  target: 'node',
  context: __dirname,
  experiments: {
    outputModule: true,
  },
  entry: {
    index: './src/backend.ts',
    dto: './src/_base/dto/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'module' },
    filename: '[name].js',
    chunkFormat: 'module',
  },
  externals: {
    oracledb: 'oracledb',
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
