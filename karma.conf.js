const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    basePath: '.',
    port: 9876,
    frameworks: ['mocha'],
    reporters: ['mocha'],
    mochaReporter: {
      output: 'autowatch',
      showDiff: true,
    },
    autoWatch: true,
    colors: true,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity,
    files: [
      'src/**/*.test.ts',
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.test.ts': ['webpack'],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
    },
  });
};
