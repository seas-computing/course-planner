const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const {
  APP_NAME,
  SERVER_URL,
  PUBLIC_CLIENT_URL,
  APP_VERSION
} = process.env;

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
    emitOnErrors: false,
    nodeEnv: 'production',
    chunkIds: 'total-size',
    moduleIds: 'size'
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
      title: APP_NAME,
      template: "./index.html"
    }),
    new webpack.DefinePlugin({
      'process.env.SERVER_URL': JSON.stringify(SERVER_URL),
      'process.env.PUBLIC_CLIENT_URL': JSON.stringify(PUBLIC_CLIENT_URL),
      'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
