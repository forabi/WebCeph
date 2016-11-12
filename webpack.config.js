const webpack = require('webpack');
const fail = require('webpack-fail-plugin');
const path = require('path');
const env = require('./env');
const WebpackHTMLPlugin = require('webpack-html-plugin');
const { compact } = require('lodash');
const autoprefixer = require('autoprefixer');
const BabiliPlugin = require('babili-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

let Dashboard;
let DashboardPlugin;
let dashboard;

if (env.isDev) {
  Dashboard = require('webpack-dashboard');
  DashboardPlugin = require('webpack-dashboard/plugin');

  dashboard = new Dashboard();
}

const prod = p => (env.isProd ? p : null);
const hot = p => (env.isHot ? p : null);
const dev = p => (env.isDev ? p : null);

const localCSSLoaders = [
  'style',
  {
    loader: 'css',
    query: {
      module: true,
      localIdentName: '[name]_[local]_[hash:base64:5]',
    },
  },
  'postcss',
];

const globalCSSLoaders = [
  'style', 'css', 'postcss',
];

const sassLoaders = [
  {
    loader: 'sass', query: { sourceMap: true },
  },
];

const buildPath = env.isProd ? '' : '/';

const config = {
  devServer: env.isDev ? {
    inline: true,
    contentBase: buildPath,
    hot: env.isHot,
  } : undefined,

  devtool: env.isDev ? 'eval' : false,

  entry: {
    bundle: compact([
      hot('react-hot-loader/patch'),
      hot('webpack/hot/only-dev-server'),
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
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: compact([
          prod('babel-loader'),
          {
            loader: 'ts-loader',
            query: {
              transpileOnly: true,
              silent: true,
              compilerOptions: Object.assign(
                {
                  module: 'es2015',
                },
                env.isProd ? {
                  jsx: 'preserve',
                } : { }
              ),
            },
          },
        ]),
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }, {
        test: /\.css$/,
        use: localCSSLoaders,
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(path.resolve(__dirname, 'src/components')),
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
    ],
  },

  plugins: compact([
    new webpack.LoaderOptionsPlugin({
      options: {
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
    fail,
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
    new webpack.ProvidePlugin({
      Promise: 'bluebird',
    }),
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(env.isDev),
      'process.env.ENVIRONMENT': JSON.stringify('BROWSER'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      isBrowser: true,
      isHot: JSON.stringify(Boolean(process.env.HOT)),
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/service-worker.ts'),
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    prod(new webpack.optimize.OccurrenceOrderPlugin(true)),
    prod(new BabiliPlugin()),
  ]),
};

module.exports = config;
