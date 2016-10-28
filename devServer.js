const moment = require('moment');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config');
const analyticsRouter = require('./analytics');
const env = require('./env');

const router = new express.Router();

if (env.isDevelopment) {
  const compiler = webpack(webpackConfig);

  router.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: false,
    quiet: true,
    historyApiFallback: true,
  }));

  router.use(webpackHotMiddleware(compiler, {
    log: () => null,
    heartbeat: 10 * 1000,
    reload: true,
  }));

  router.use('/analytics', analyticsRouter);
} else if (env.isProduction) {
  router.use('/', express.static(
    './build',
    {
      maxAge: moment.duration(1, 'y').asMilliseconds(),
    },
  ));
}

const app = express();

app.use(router);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
