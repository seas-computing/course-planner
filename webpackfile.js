const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackRootPlugin = require('html-webpack-root-plugin');
const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
/**
 * NestJs uses a custom wrapper around require() that allows it to show a
 * warning when some extra package needs to be installed. This causes problems
 * with webpack, so we're blacklisting packages we're not using with the
 * IgnorePlugin below.
 *
 * To de-blacklist a package, just remove it from this array.
 */
const nestBlacklist = [
  '^class-validator$',
  '^class-transformer$',
  '^cache-manager$',
  '^@nestjs/microservices$',
  // packages below are required from microservices
  '^amqp-connection-manager$',
  '^amqplib$',
  '^grpc$',
  '^mqtt$',
  '^nats$',
  '^redis$',
];

const optimization = {
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
};

const splitChunks = {
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
};


const mode = 'none';

const wpResolve = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  plugins: [
    new TSConfigPathsPlugin(),
  ],
};

const tsLoader = {
  test: /\.tsx?$/,
  include: resolve(__dirname, 'src'),
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        happyPackMode: true,
      },
    },
  ],
};

const client = {
  name: 'client',
  mode,
  entry: ['./src/client/index.tsx'],
  output: {
    path: resolve(__dirname, 'build/static'),
    filename: 'app.js',
    publicPath: '/static/',
  },
  resolve: wpResolve,
  target: 'web',
  module: {
    rules: [
      {
        ...tsLoader,
        test: /\.(t|j)sx?$/,
        exclude: [],
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
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  optimization: { ...optimization, splitChunks },
  plugins: [
    new HtmlWebpackPlugin({
      title: process.env.APP_NAME,
    }),
    new HtmlWebpackRootPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

const server = {
  name: 'server',
  mode,
  devtool: 'source-map',
  context: resolve(__dirname),
  entry: ['./src/server/index.ts'],
  externals: [nodeExternals()],
  output: {
    path: resolve(__dirname, 'build'),
    filename: 'server.js',
  },
  resolve: wpResolve,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.xml$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      tsLoader,
    ],
  },
  optimization,
  plugins: [
    new webpack.IgnorePlugin({
      contextRegExp: /@nestjs/,
      resourceRegExp: new RegExp(nestBlacklist.join('|')),
    }),
    new webpack.IgnorePlugin(/^\.\/middleware\/dev\.middleware$/),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  node: {
    __dirname: false,
  },
};

module.exports = [client, server];
