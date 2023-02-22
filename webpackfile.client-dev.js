const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const publicPath = '/courses';

const {
  APP_NAME,
  CLIENT_PORT,
  SERVER_URL,
  SERVER_PORT,
  PUBLIC_CLIENT_URL,
  APP_VERSION
} = process.env;

/**
 * This webpack configuration handles hot-reloading of client code in
 * development.
 *
 * To change the production configuration for webpack, see webpackfile.js
 */

module.exports = {
  name: 'client',
  target: 'web',
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  entry: [
    'react-hot-loader/patch',
    './src/client/index.tsx',
  ],
  devServer: {
    // This will push everything to the index.html file, letting us handle
    // routing via React Router
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/courses/index.html' },
      ],
    },
    // We need to open the server to everyone so we can reach it from outside
    // the container
    host: '0.0.0.0',
    hot: true,
    port: CLIENT_PORT,
    static: {
      serveIndex: false,
      publicPath,
    },
    allowedHosts: "all",
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
      template: "./index.html",
    }),
    new webpack.DefinePlugin({
      'process.env.SERVER_URL': JSON.stringify(SERVER_URL),
      'process.env.PUBLIC_CLIENT_URL': JSON.stringify(PUBLIC_CLIENT_URL),
      'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
    }),
  ],
};
