/* eslint-disable no-param-reassign, no-console */
function WebpackFailPlugin() {
  this.plugin('done', (stats) => {
    if (stats.compilation.warnings.length) {
      // Log each of the warnings
      stats.compilation.warnings.forEach((warning) => {
        console.log(warning.message || warning);
      });

      // Pretend no assets were generated. This prevents the tests
      // from running making it clear that there were warnings.
      stats.stats = [{
        toJson() {
          return this;
        },
        assets: [],
      }];

      // Exit with error code
      process.exit(1);
    }
  });
}

module.exports = WebpackFailPlugin;
