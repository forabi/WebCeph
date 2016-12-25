const isTest = process.env.NODE_ENV === 'test';

exports.isProduction = process.env.NODE_ENV === 'production';
exports.isTest = isTest;
exports.isDevelopment = isTest || process.env.NODE_ENV === 'development';
exports.isDev = exports.isDevelopment;
exports.isProd = exports.isProduction;
exports.isHot = Boolean(process.env.HOT);
exports.isBrowser = !process && typeof window !== 'undefined';
