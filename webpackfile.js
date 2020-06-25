const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

/**
 * This Webpack configuration only handles bundling the client code in
 * production.
 *
 * Changes to the dev configuration should be made in:
 *    webpackfile.client-dev.js
 *    webpackfile.server-dev.js
 */

module.exports = {
  name: 'client',
  mode: 'production',
  entry: ['./src/client/index.tsx'],
  output: {
    path: resolve(__dirname, 'build/client'),
    filename: 'app.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.svg'],
    plugins: [
      new TSConfigPathsPlugin(),
    ],
  },
  target: 'web',
  module: {
    rules: [
      {
        include: resolve(__dirname, 'src'),
        test: /\.(t|j)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.client.json',
              happyPackMode: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      sourceMap: true,
    })],
    noEmitOnErrors: true,
    nodeEnv: 'production',
    occurrenceOrder: true,
    providedExports: true,
    usedExports: true,
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      name: true,
      minSize: 1,
      minChunks: 1,
      cacheGroups: {
        assets: {
          test: /[\\/]node_modules[\\/]/,
          enforce: true,
          reuseExistingChunk: true,
          filename: '[name][hash].js',
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: process.env.APP_NAME,
    }),
    new HtmlWebpackRootPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
