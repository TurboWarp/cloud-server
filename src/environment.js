module.exports.isProduction = process.env.NODE_ENV === 'production';
module.exports.isTest = process.env.NODE_ENV === 'test';
module.exports.isDevelopment = !(module.exports.isProduction || module.exports.isTest);
