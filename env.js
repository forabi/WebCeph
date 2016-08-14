exports.isProduction = process.env.NODE_ENV === 'production';
exports.isDevelopment = process.env.NODE_ENV === 'development';
exports.isDev = exports.isDevelopment;
exports.isProd = exports.isProduction;
exports.isHot = Boolean(process.env.HOT);
exports.isTest = process.env.NODE_ENV === 'test';
exports.isBrowser = !process && window;
