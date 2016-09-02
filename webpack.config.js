const webpack = require('webpack');
const fail = require('webpack-fail-plugin');
const path = require('path');
const env = require('./env');
const WebpackHTMLPlugin = require('webpack-html-plugin');
const { compact } = require('lodash');

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
];

const globalCSSLoaders = ['style', 'css'];

const sassLoaders = [
  {
    loader: 'sass', query: { sourceMap: true },
  },
];

const buildPath = '/';

const config = {
  devServer: env.isDev ? {
    inline: true,
    contentBase: buildPath,
    hot: env.isHot,
  } : false,

  debug: env.isDev,

  devtool: env.isDev ? 'eval' : false,

  entry: {
    bundle: compact([
      hot('react-hot-loader/patch'),
      hot('webpack/hot/only-dev-server'),
      hot('webpack-hot-middleware/client'),
      path.resolve(__dirname, './src/index.tsx'),
    ]),
    vendor: [
      'react',
      'fabric',
      'material-ui/List',
      'material-ui/RaisedButton',
      'material-ui/FlatButton',
      'material-ui/Slider',
      'material-ui/Popover',
      'material-ui/Menu',
      'material-ui/MenuItem',
      'material-ui/Checkbox',
      'material-ui/Divider',
    ],
  },

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name]_[hash].js',
    publicPath: buildPath,
  },

  resolve: {
    root: __dirname,
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },

  module: {
    loaders: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loaders: compact([
        prod('babel-loader'),
        {
          loader: 'ts-loader',
          query: {
            transpileOnly: true,
            compilerOptions: {
              module: 'es2015',
            },
          },
        },
      ]),
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ['babel-loader'],
    }, {
      test: /\.css$/,
      loaders: localCSSLoaders,
    }, {
      test: /\.scss$/,
      include: [
        path.resolve(path.resolve(__dirname, 'src/components')),
      ],
      loaders: [].concat(localCSSLoaders, sassLoaders),
    }, {
      test: /\.scss$/,
      include: [
        path.resolve(path.resolve(__dirname, 'src/layout')),
      ],
      loaders: [].concat(globalCSSLoaders, sassLoaders),
    }, {
      test: /\.(jpg|png)$/,
      loader: 'file',
    }, {
      test: /\.json$/,
      loader: 'json',
    }, {
      test: /\.html$/,
      loader: 'html',
    }, {
      test: /\.svg$/,
      loader: [
        'babel-loader',
        {
          loader: 'react-svg',
          query: {
            svgo: {
              plugins: [{ cleanupIDs: false, removeEmptyContainers: true }],
            },
          },
        },
      ],
    }],
  },

  plugins: compact([
    hot(new webpack.HotModuleReplacementPlugin()),
    fail,
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
      'process.env.ENVIRONMENT': JSON.stringify('BROWSER'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      isBrowser: true,
      isHot: JSON.stringify(Boolean(process.env.HOT)),
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    prod(new webpack.optimize.OccurrenceOrderPlugin(true)),
    prod(new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    })),
  ]),
};

module.exports = config;
