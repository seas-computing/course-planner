const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const publicPath = '/courses';

const {
  SERVER_PORT,
  CLIENT_PORT,
  APP_NAME,
} = process.env;

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
    'react-hot-loader/patch',
    './src/client/index.tsx',
  ],
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/courses/index.html' },
      ],
    },
    host: '0.0.0.0',
    hot: true,
    hotOnly: true,
    port: CLIENT_PORT,
    publicPath,
    proxy: {
      '/api': `http://node:${SERVER_PORT}`,
    },
    serveIndex: false,
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
      title: APP_NAME,
    }),
    new HtmlWebpackRootPlugin(),
  ],
};
