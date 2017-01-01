const compact = require('lodash/compact');
const env = require('./env');

const ci = p => (env.isCI ? p : null);

const coverageDir = process.env.COVERAGE_DIR || 'coverage';

module.exports = (config) => {
  /* eslint-disable global-require */
  const webpackConfig = require('./webpack.config');
  webpackConfig.devtool = 'inline-source-map';
  webpackConfig.entry = { };
  config.set({
    frameworks: ['mocha', 'source-map-support'],
    files: [
      'tests.webpack.js',
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },
    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-source-map-support',
      'karma-junit-reporter',
      'karma-coverage',
      'karma-webpack',
    ],
    reporters: compact([
      'mocha',
      'coverage',
      ci('junit'),
    ]),
    mochaReporter: {
      showDiff: true,
    },
    junitReporter: {
      outputFile: `${process.env.CIRCLE_TEST_REPORTS}/junit/test-results.xml`,
    },
    coverageReporter: {
      reporters: compact([
        {
          type: 'json',
          dir: `${coverageDir}/json`,
          subdir: '.',
        },
        {
          type: 'lcov',
          dir: `${coverageDir}/lcov`,
          subdir: '.',
        },
      ]),
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