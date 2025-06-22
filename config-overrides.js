const webpack = require('webpack');

module.exports = function override(config) {
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }

  // Disable fullySpecified to fix react-router ESM import errors
  config.resolve.fullySpecified = false;

  // Add alias for process/browser.js to fix fully specified import error
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  config.resolve.alias['process/browser'] = require.resolve('process/browser.js');

  Object.assign(config.resolve.fallback, {
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert/"),
    "util": require.resolve("util/"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url/")
  });

  if (!config.plugins) {
    config.plugins = [];
  }
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
