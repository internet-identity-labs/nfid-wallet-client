// Load environment variables FIRST using require (not import, to avoid hoisting)
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Determine which .env file to use (defaults to .env.local)
const envFile = process.env.ENV_FILE || '.env.local';
const envPath = path.resolve(__dirname, '../../', envFile);

// Load .env file if it exists
if (fs.existsSync(envPath)) {
  console.log(`[webpack] Loading environment from: ${envFile}`);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`[webpack] Error loading ${envFile}:`, result.error);
  }
} else {
  console.warn(`[webpack] Warning: Environment file ${envFile} not found at ${envPath}`);
}

// Now import everything else via require to avoid TS type issues
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const { JEST_GLOBALS } = require('../../config/jest-globals');
const { serviceConfig } = require('../../config/webpack-env.cjs');

// Build the webpack config using Nx composable plugins (in JS to avoid TS type conflicts)
const config = composePlugins(
  withNx(),
  withReact({
    svgr: true,
  }),
  (config) => {
    // TypeScript path resolution
    config.resolve = config.resolve || {};
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        mainFields: ['module', 'main'],
      })
    );

    // Node.js polyfills for browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      events: require.resolve('events'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      vm: require.resolve('vm-browserify'),
    };

    // Modify Babel loader to process workspace packages
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    // Find and modify babel-loader rules
    const modifyBabelLoader = (rule) => {
      if (rule.loader && typeof rule.loader === 'string' && rule.loader.includes('babel-loader')) {
        rule.exclude = /node_modules/;
        delete rule.include;
        return rule;
      }
      if (rule.oneOf) {
        rule.oneOf = rule.oneOf.map(modifyBabelLoader);
      }
      if (rule.use && Array.isArray(rule.use)) {
        rule.use = rule.use.map((loader) => {
          if (typeof loader === 'object' && loader.loader && loader.loader.includes('babel-loader')) {
            return {
              ...loader,
              exclude: /node_modules/,
            };
          }
          return loader;
        });
      }
      return rule;
    };

    config.module.rules = config.module.rules.map(modifyBabelLoader);

    // Plugins
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin(serviceConfig),
      new webpack.ProvidePlugin({
        Buffer: [require.resolve('buffer/'), 'Buffer'],
        process: require.resolve('process/browser'),
      })
    );

    // Ignore warnings
    config.ignoreWarnings = [/Failed to parse source map from/];

    // DevServer configuration
    config.devServer = {
      ...config.devServer,
      open: false,
      port: 4200,
    };

    return config;
  }
);

module.exports = config;

