const webpack = require('webpack');
const fail = require('webpack-fail-plugin');
const path = require('path');
const env = require('./env');
const WebpackHTMLPlugin = require('webpack-html-plugin');

const cssLoaders = ['style', 'css?module=1&localIdentName=[name]_[local]_[hash:base64:5]'];

const buildPath = '/';

const config = {
  debug: true,

  devtool: 'source-map',

  entry: {
    bundle: [
      path.resolve(__dirname, './src/index.tsx'),
    ],
    vendor: ['react', 'material-ui', 'lodash'],
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
      loaders: [{
        loader: 'ts-loader',
        query: {
          transpileOnly: true,
          compilerOptions: {
            module: 'es2015',
          },
        },
      }],
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ['babel-loader'],
    }, {
      test: /\.css$/,
      loaders: cssLoaders,
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

  plugins: [
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
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  ],
};

if (env.isDevelopment) {
  config.devtool = 'eval';
  config.devServer = {
    inline: true,
    contentBase: buildPath,
  };
  if (env.isHot) {
    config.devServer.hot = true;
    config.entry.bundle.unshift('webpack-hot-middleware/client');
    config.entry.bundle.unshift('webpack/hot/only-dev-server');
    config.entry.bundle.unshift('react-hot-loader/patch');
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
  }
}

if (env.isProduction) {
  config.devtool = false;
  config.debug = false;
  config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true));
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
  }));
}

module.exports = config;
