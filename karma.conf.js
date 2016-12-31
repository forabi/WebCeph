const compact = require('lodash/compact');
const env = require('./env');

const ci = p => (env.isCI ? p : null);

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
      'karma-junit-reporter',
      'karma-webpack',
    ],
    reporters: compact([
      'mocha',
      ci('junit'),
    ]),
    mochaReporter: {
      showDiff: true,
    },
    junitReporter: {
      outputFile: `${process.env.CIRCLE_TEST_REPORTS}/junit/test-results.xml`,
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
