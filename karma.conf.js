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
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],
    reporters: ['mocha'],
    mochaReporter: {
      showDiff: true,
      output: 'autowatch',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    webpack: webpackConfig,
    webpackServer: {
      stats: {
        chunks: false,
      },
      noInfo: true,
    },
  });
};
