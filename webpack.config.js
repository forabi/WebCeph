/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const webpack = require('webpack');
const path = require('path');
const {
  isProd,
  ifProd,
  ifHot,
  isHot,
  isDev,
} = require('@hollowverse/utils/helpers/env');
const WebpackHTMLPlugin = require('html-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
const { compact } = require('lodash');

const localCSSLoaders = [
  'style-loader',
  {
    loader: 'css-loader',
    query: {
      module: true,
      localIdentName: '[name]_[local]_[hash:base64:5]',
    },
  },
];

const globalCSSLoaders = ['style-loader', 'css-loader'];

const config = {
  mode: isProd ? 'production' : 'development',

  performance: false,

  optimization: {
    namedModules: true,
    namedChunks: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js'],
    modules: [path.join(__dirname, 'src'), __dirname, 'node_modules'],
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: isProd ? '[name]_[chunkhash].js' : '[name].js',
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          { loader: 'ts-loader', options: { transpileOnly: isDev } },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.module\.css$/,
        exclude: /node_modules/,
        use: [...localCSSLoaders],
      },
      {
        test: /\.global\.css$/,
        exclude: /node_modules/,
        use: [...globalCSSLoaders],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
    ],
  },

  plugins: compact([
    ifHot(new webpack.HotModuleReplacementPlugin()),
    new webpack.WatchIgnorePlugin([/node_modules/]),
    new WebpackHTMLPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      inject: 'body',
      minify: isProd
        ? {
            html5: true,
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
          }
        : false,
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify('v2'),
      __DEBUG__: JSON.stringify(isDev),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      isBrowser: true,
      isHot,
    }),
    ifProd(new BabelMinifyPlugin()),
  ]),
};

module.exports = config;
