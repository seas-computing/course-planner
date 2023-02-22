const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 * This webpack configuration handles hot-reloading of server code in
 * development.
 *
 * To change the production configuration for webpack, see webpackfile.js
 */

module.exports = {
  entry: [
    'webpack/hot/poll?100',
    './src/server/index.ts',
  ],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.server.json',
            },
          },
        ],
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TSConfigPathsPlugin(),
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new StartServerPlugin({ name: 'server.js' }),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
  },
};
