/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const fail = require('webpack-fail-plugin');
const failTests = require('./webpack-fail-tests-plugin');
const path = require('path');
const env = require('./env');
const WebpackHTMLPlugin = require('webpack-html-plugin');
const { compact } = require('lodash');
const autoprefixer = require('autoprefixer');
const AsyncModulePlugin = require('async-module-loader/plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

let Dashboard;
let DashboardPlugin;
let dashboard;

/* eslint-disable global-require */
if (env.isDev && !env.isTest) {
  Dashboard = require('webpack-dashboard');
  DashboardPlugin = require('webpack-dashboard/plugin');

  dashboard = new Dashboard();
}

const prod = p => (env.isProd ? p : null);
const hot = p => (env.isHot ? p : null);
const test = p => (env.isTest ? p : null);

const pkg = require('./package.json');

const localCSSLoaders = [
  'style-loader',
  {
    loader: 'css-loader',
    query: {
      module: true,
      localIdentName: '[name]_[local]_[hash:base64:5]',
    },
  },
  'postcss-loader',
];

const globalCSSLoaders = [
  'style-loader',
  'css-loader',
  'postcss-loader',
];

const sassLoaders = [
  {
    loader: 'sass-loader',
    query: {
      sourceMap: true,
    },
  },
];

const buildPath = env.isProd ? '' : '/';

const config = {
  bail: env.isProd || env.isTest,

  devServer: env.isDev ? {
    inline: true,
    contentBase: buildPath,
    hot: env.isHot,
  } : undefined,

  devtool: env.isDev ? 'eval' : 'inline-source-map',

  entry: {
    bundle: compact([
      hot('react-hot-loader/patch'),
      hot('webpack-hot-middleware/client'),
      path.resolve(__dirname, './src/index.tsx'),
    ]),
    lib: [
      'react',
      'react-dom',
      'reselect',
      'redux',
      'react-redux',
      'redux-actions',
      'redux-undo',
      'lodash/assign',
      'lodash/map',
      'lodash/findIndex',
      'lodash/attempt',
      'lodash/curry',
      'lodash/reduce',
      'lodash/find',
      'lodash/uniqBy',
      'lodash/isEmpty',
      'lodash/omit',
      'lodash/filter',
      'lodash/memoize',
      'material-ui/CircularProgress',
      'material-ui/Dialog',
      'material-ui/List/List',
      'material-ui/List/ListItem',
      'material-ui/RaisedButton',
      'material-ui/FlatButton',
    ],
  },

  performance: env.isDev ? false : undefined,

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: env.isProd ? '[name]_[chunkhash].js' : '[name]_[hash].js',
    publicPath: buildPath,
  },

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },

  module: {
    rules: compact([
      test({
        enforce: 'post',
        test: /\.tsx?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: [
          /node_modules/,
          /\.test\.tsx?$/,
        ],
        use: [
          {
            loader: 'istanbul-instrumenter-loader',
            query: {
              esModules: true,
            },
          },
        ],
      }),
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: compact([
          hot('react-hot-loader/webpack'),
          prod('babel-loader'),
          {
            loader: 'ts-loader',
            query: {
              transpileOnly: true,
              silent: true,
              compilerOptions: Object.assign(
                { module: 'es2015' },
                env.isProd ? {
                  jsx: 'preserve',
                } : { },
              ),
            },
          },
        ]),
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: compact([
          hot('react-hot-loader/webpack'),
          'babel-loader',
        ]),
      },
      {
        test: /\.css$/,
        use: localCSSLoaders,
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(path.resolve(__dirname, 'src/components')),
          path.resolve(path.resolve(__dirname, 'src/transitions')),
        ],
        use: [...localCSSLoaders, ...sassLoaders],
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(path.resolve(__dirname, 'src/layout')),
        ],
        use: [...globalCSSLoaders, ...sassLoaders],
      },
      {
        test: /\.html$/,
        use: 'html',
      },
    ]),
  },

  plugins: compact([
    prod(fail),
    test(failTests),
    new webpack.LoaderOptionsPlugin({
      options: {
        minimize: true,
        debug: false,
        context: __dirname,
        postcss() {
          return {
            defaults: [autoprefixer],
          };
        },
        svgoConfig: {
          plugins: [
            { removeXMLNS: true },
            { cleanupIDs: false },
            { convertShapeToPath: false },
            { removeEmptyContainers: false },
            { removeViewBox: false },
            { mergePaths: false },
            { convertStyleToAttrs: false },
            { convertPathData: false },
            { convertTransform: false },
            { removeUnknownsAndDefaults: false },
            { collapseGroups: false },
            { moveGroupAttrsToElems: false },
            { moveElemsAttrsToGroup: false },
            { cleanUpEnableBackground: false },
            { removeHiddenElems: false },
            { removeNonInheritableGroupAttrs: false },
            { removeUselessStrokeAndFill: false },
            { transformsWithOnePath: false },
          ],
        },
      },
    }),
    hot(new webpack.HotModuleReplacementPlugin()),
    dashboard ? new DashboardPlugin(dashboard.setData) : null,
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common'],
      minSize: 100000,
    }),
    new WebpackHTMLPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/index.html'),
      inject: 'body',
      minify: env.isProduction ? {
        html5: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
      } : false,
    }),
    new AsyncModulePlugin(),
    new webpack.ProvidePlugin({
      Promise: 'bluebird',
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
      __DEBUG__: JSON.stringify(env.isDev),
      'process.env.ENVIRONMENT': JSON.stringify('BROWSER'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      isBrowser: true,
      isHot: JSON.stringify(Boolean(process.env.HOT)),
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/service-worker.ts'),
    }),
    prod(new webpack.optimize.OccurrenceOrderPlugin(true)),
    prod(new BabiliPlugin()),
    new CopyPlugin([
      { from: 'src/assets/icons', to: 'icons' },
      { from: 'src/manifest.json', to: 'manifest.json' },
    ]),
  ]),
};

module.exports = config;
