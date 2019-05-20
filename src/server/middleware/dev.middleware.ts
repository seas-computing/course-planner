import { resolve } from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-middleware';
import webpackHotServer from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const publicPath = '/';

/**
 * Configures react development for the client.
 */

const config = {
  name: 'client',
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client',
    'react-hot-loader/patch',
    './src/client/index.js',
  ],
  output: {
    path: resolve(__dirname, 'build/static'),
    filename: 'app.js',
    publicPath,
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
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
    ],
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Docker App',
      template: resolve(__dirname, '.src/client/index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

const compiler = webpack(config);

/**
 * Implements the webpack development server middleware to server
 * Compiled client code from memory. The Hot Server also allows for
 * live module replacement.
 */

export const devServer = webpackDevServer(compiler, {
  publicPath,
});
export const hotServer = webpackHotServer(compiler, {
  publicPath,
});
