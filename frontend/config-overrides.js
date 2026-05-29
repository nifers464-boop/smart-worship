const webpack = require('webpack');

module.exports = function override(config) {
  // Fallback and Aliases for Node.js modules including node: prefix
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      "node:fs": false,
      "node:path": require.resolve("path-browserify"),
      "node:os": require.resolve("os-browserify/browser"),
      "node:crypto": require.resolve("crypto-browserify"),
      "node:stream": require.resolve("stream-browserify"),
      "node:buffer": require.resolve("buffer"),
      "node:http": require.resolve("stream-http"),
      "node:https": require.resolve("https-browserify"),
      "node:url": require.resolve("url/"),
      "node:process": require.resolve("process/browser"),
      // Ignore canvas for pdfjs
      "canvas": false,
    },
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "zlib": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "process": require.resolve("process/browser"),
    }
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};