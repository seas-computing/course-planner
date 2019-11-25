import { resolve } from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-middleware';
import webpackHotServer from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackRootPlugin from 'html-webpack-root-plugin';
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const publicPath = '/';

/**
 * Configures react development for the client.
 */

const compiler = webpack([{
  name: 'client',
  target: 'web',
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    'react-hot-loader/patch',
    './src/client/index.ts',
  ],
  output: {
    path: resolve(__dirname, 'build/static'),
    filename: 'app.js',
    publicPath,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
}]);

/**
 * Implements the webpack development server middleware to server
 * Compiled client code from memory. The Hot Server also allows for
 * live module replacement.
 */

export const devServer = webpackDevServer(compiler, {
  publicPath,
});
export const hotServer = webpackHotServer(compiler);
