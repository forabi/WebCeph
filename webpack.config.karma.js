/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const env = require('./env');

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

const buildPath = '/';

const config = {
  devServer: env.isDev ? {
    inline: true,
    contentBase: buildPath,
    hot: env.isHot,
  } : undefined,

  devtool: 'inline-source-map',

  entry: {
    bundle: [
      path.resolve(__dirname, './src/index.tsx'),
    ],
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
        use: [
          {
            loader: 'ts-loader',
            query: {
              transpileOnly: env.isDev,
              silent: env.isDev,
              compilerOptions: Object.assign(
                env.isProd ? {
                  jsx: 'preserve',
                } : { },
              ),
            },
          },
        ],
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
    ],
  },
};

module.exports = config;
