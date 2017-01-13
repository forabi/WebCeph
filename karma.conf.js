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
      'karma-remap-coverage',
      'karma-webpack',
    ],
    reporters: compact([
      'mocha',
      'coverage',
      'remap-coverage',
      ci('junit'),
    ]),
    mochaReporter: {
      output: 'autowatch',
      showDiff: true,
    },
    junitReporter: {
      outputFile: `${process.env.CIRCLE_TEST_REPORTS}/junit/test-results.xml`,
    },
    coverageReporter: {
      type: 'in-memory',
    },
    remapCoverageReporter: {
      'text-summary': null,
      html: `${coverageDir}/html`,
      json: `${coverageDir}/coverage.json`,
      lcovonly: `${coverageDir}/coverage.lcov`,
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
