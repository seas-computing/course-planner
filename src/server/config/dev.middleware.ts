import { resolve } from 'path';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-middleware';
import webpackHotServer from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackRootPlugin from 'html-webpack-root-plugin';
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const publicPath = '/';

/**
 * This webpack configuration handles live-reloading of our code in development
 * through the webpack-dev-middleware. To change the production configuration
 * for webpack, see the webpackfile.js in the project root.
 */

const compiler = webpack([{
  name: 'client',
  target: 'web',
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    'react-hot-loader/patch',
    './src/client/index.tsx',
  ],
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
}]);

/**
 * Implements the webpack development server middleware to serve
 * compiled client code from memory. The Hot Server also allows for
 * live module replacement.
 */

export const devServer = webpackDevServer(compiler, {
  publicPath,
});
export const hotServer = webpackHotServer(compiler);
