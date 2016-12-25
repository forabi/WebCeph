module.exports = (config) => {
  /* eslint-disable global-require */
  const webpackConfig = require('./webpack.config');
  webpackConfig.devtool = 'inline-source-map';
  webpackConfig.entry = { };
  config.set({
    frameworks: ['mocha'],
    files: [
      'tests.webpack.js',
    ],
    exclude: [],
    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap'],
    },
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
  });
};
