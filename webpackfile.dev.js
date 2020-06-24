const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const publicPath = '/';

/**
 * This webpack configuration handles live-reloading of our code in development
 * To change the production configuration for webpack, see webpackfile.prod.js
 */

module.exports = {
  name: 'client',
  target: 'web',
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    'react-hot-loader/patch',
    './src/client/index.tsx',
  ],
  devServer: {
    port: 3000,
    allowedHosts: '127.0.0.1',
    hot: true,
    hotOnly: true,
    proxy: {
      '/api': 'http://node:3001',
    },
  },
  output: {
    path: resolve(__dirname, 'build/static'),
    filename: 'app.js',
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['react-hot-loader/babel'],
            },
          },
          'ts-loader',
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
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.svg'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    plugins: [
      new TSConfigPathsPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: process.env.APP_NAME,
    }),
    new HtmlWebpackRootPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
