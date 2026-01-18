const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Default config is fine as Babel will handle the alias to CJS
module.exports = config;
