// Load environment variables FIRST using require (not import, to avoid hoisting)
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

function loadEnvForWebpack() {
  const explicitEnvFile = process.env.ENV_FILE;
  const env = process.env.ENV;
  if (explicitEnvFile) {
    const envPath = path.resolve(__dirname, '../../', explicitEnvFile);
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.error(`[webpack] Error loading ${explicitEnvFile}:`, result.error);
      }
    } else {
      console.warn(
        `[webpack] Warning: Environment file ${explicitEnvFile} not found at ${envPath}`,
      );
    }
    return;
  }
  if (!env || env === 'local') {
    const envFile = '.env.local';
    const envPath = path.resolve(__dirname, '../../', envFile);
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.error(`[webpack] Error loading ${envFile}:`, result.error);
      }
    } else {
      console.warn(
        `[webpack] Warning: Environment file ${envFile} not found at ${envPath}`,
      );
    }
    return;
  }
}

loadEnvForWebpack();

const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const CspHtmlWebpackPlugin = require('@melloware/csp-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const { serviceConfig } = require('../../config/webpack-env.cjs');
const dfxJson = require('../../dfx.json');

if (!process.env.DISABLE_ESLINT_PLUGIN) {
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
}

const DFX_PORT = dfxJson.networks.local.bind.split(':')[1];
const isExampleBuild = process.env.EXAMPLE_BUILD === '1';
const isProduction = process.env.FRONTEND_MODE === 'production';

const setupCSP = () => {
  if (isProduction) {
    const cspConfigPolicy = {
      'default-src': "'none'",
      'object-src': "'none'",
      'base-uri': "'self'",
      'connect-src': [
        "'self'",
        'https://ic0.app',
        'https://*.ic0.app',
        'https://*.icp0.io',
        process.env.AWS_BASE_EP,
        'https://rosetta-api.internetcomputer.org',
        'https://free.currconv.com/',
        'https://us-central1-entrepot-api.cloudfunctions.net',
        'https://stats.g.doubleclick.net/g/collect',
        'https://registry.walletconnect.com',
        'wss://*.bridge.walletconnect.org',
        'https://mempool.space/',
        'https://api.blockcypher.com/',
        'https://api.coinbase.com',
        'https://api.pro.coinbase.com',
        'https://icp-api.io',
        'https://api.nftgeek.app',
        'https://toniq.io',
        'https://stat.yuku.app',
        'https://memecake.io',
        'https://web2.icptokens.net/api/tokens',
        'https://accounts.google.com/gsi/',
        'https://sepolia.infura.io/',
        'https://mainnet.infura.io/',
        'https://etherscan.io/',
        'https://api.etherscan.io/',
        'https://api-sepolia.etherscan.io/',
        'https://api.icexplorer.io/api/dashboard/search',
        'https://deep-index.moralis.io',
      ],
      'worker-src': "'self' blob:",
      'img-src': ["'self' blob: data: content: https:"],
      'font-src': [
        "'self'",
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ],
      'frame-src': [
        "'self'",
        'https://*.ic0.app',
        'https://accounts.google.com/gsi/style',
        'https://accounts.google.com/',
      ],
      'manifest-src': "'self'",
      'style-src': [
        "'self'",
        // FIXME: libraries adding inline styles:
        // - google button
        "'unsafe-inline'",
        // FIXME: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        'https://accounts.google.com/gsi/style',
        'https://fonts.googleapis.com',
      ],
      'script-src': [
        "'self'",
        // FIXME: required for WebAssembly.instantiate()
        "'unsafe-eval'",
        "'sha256-6dv10xlkUu6+B73+WBPb1lJ7kFQFnr086T6FvXhkfHY='",
        'https://accounts.google.com/gsi/client',
      ],
      'require-trusted-types-for': ["'script'"],
      'media-src': ["'self'", process.env.NFID_PROVIDER_URL],
    };

    return [
      new CspHtmlWebpackPlugin(cspConfigPolicy, {
        primeReactEnabled: false,
        hashEnabled: {
          'style-src': false,
        },
        nonceEnabled: {
          'style-src': false,
        },
      }),
    ];
  }
  return [];
};

const config = composePlugins(
  withNx(),
  withReact({
    svgr: true,
  }),
  (config) => {
    config.resolve = config.resolve || {};
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        mainFields: ['module', 'main'],
      })
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      frontend: path.resolve(__dirname, 'src'),
    };

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

    config.resolve.modules = [
      ...(config.resolve.modules || ['node_modules']),
      path.resolve(__dirname, '../../node_modules'),
    ];

    config.resolve.extensions = ['.js', '.ts', '.jsx', '.tsx'];
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    const modifyBabelLoader = (rule) => {
      if (rule.loader && typeof rule.loader === 'string' && rule.loader.includes('babel-loader')) {
        rule.exclude = /node_modules\/(?!(@dfinity\/ledger-icp)\/).*/;
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
              exclude: /node_modules\/(?!(@dfinity\/ledger-icp)\/).*/,
            };
          }
          return loader;
        });
      }
      return rule;
    };

    config.module.rules = config.module.rules.map(modifyBabelLoader);
    config.optimization = {
      ...config.optimization,
      minimize: !isExampleBuild,
    };
    config.plugins = config.plugins || [];
    const canisterEnv = {
      ...(isExampleBuild ? {} : serviceConfig),
    };

    config.plugins.push(
      new webpack.DefinePlugin(canisterEnv),
      new webpack.ProvidePlugin({
        Buffer: [require.resolve('buffer/'), 'Buffer'],
        process: require.resolve('process/browser'),
      }),
      new webpack.IgnorePlugin({
        contextRegExp: /^\.\/wordlists\/(?!english)/,
        resourceRegExp: /bip39\/src$/,
      }),
      ...setupCSP()
    );
    config.output = {
      ...config.output,
      publicPath: '/',
      crossOriginLoading: 'anonymous',
    };

    config.devtool = !isProduction ? 'source-map' : false;

    config.ignoreWarnings = [/Failed to parse source map from/];

    config.devServer = {
      ...config.devServer,
      open: false,
      port: 9090,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: [
        {
          context: ['/api'],
          target: `http://0.0.0.0:${DFX_PORT}`,
        },
        {
          context: ['/signin'],
          target: process.env.AWS_SIGNIN_GOOGLE,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/signin': '' },
        },
        {
          context: ['/signin/v2'],
          target: process.env.AWS_SIGNIN_GOOGLE_V2,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/signin/v2': '' },
        },
        {
          context: ['/symmetric'],
          target: process.env.AWS_SYMMETRIC,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/symmetric': '' },
        },
        {
          context: ['/exchange-rate'],
          target: process.env.AWS_EXCHANGE_RATE,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/exchange-rate': '' },
        },
        {
          context: ['/x/tweet'],
          target: process.env.AWS_X_TWEET,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/x/tweet': '' },
        },
        {
          context: ['/signature'],
          target: process.env.AWS_SIGNATURE_EVENT,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/signature': '' },
        },
        {
          context: ['/publickey'],
          target: process.env.AWS_PUBLIC_KEY,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/publickey': '' },
        },
        {
          context: ['/ecdsa_register'],
          target: process.env.AWS_ECDSA_REGISTER,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/ecdsa_register': '' },
        },
        {
          context: ['/ecdsa_register_address'],
          target: process.env.AWS_ECDSA_REGISTER_ADDRESS,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/ecdsa_register_address': '' },
        },
        {
          context: ['/execute_candid'],
          target: process.env.AWS_EXECUTE_CANDID,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/execute_candid': '' },
        },
        {
          context: ['/ecdsa_get_anonymous'],
          target: process.env.AWS_ECDSA_GET_ANONYMOUS,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/ecdsa_get_anonymous': '' },
        },
        {
          context: ['/ecdsa_sign'],
          target: process.env.AWS_ECDSA_SIGN,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/ecdsa_sign': '' },
        },
        {
          context: ['/passkey'],
          target: process.env.AWS_PASSKEY,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/passkey': '' },
        },
        {
          context: ['/send_verification_email'],
          target: process.env.AWS_SEND_VERIFICATION_EMAIL,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/send_verification_email': '' },
        },
        {
          context: ['/link_google_account'],
          target: process.env.AWS_LINK_GOOGLE_ACCOUNT,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/link_google_account': '' },
        },
        {
          context: ['/check_verification'],
          target: process.env.AWS_CHECK_VERIFICATION,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/check_verification': '' },
        },
        {
          context: ['/verify_email'],
          target: process.env.AWS_VERIFY_EMAIL,
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/verify_email': '' },
        },
        {
          context: ['/nft_geek_api'],
          target: 'https://api.nftgeek.app',
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/nft_geek_api': '/api' },
        },
        {
          context: ['/toniq_io'],
          target: 'https://toniq.io',
          secure: true,
          changeOrigin: true,
          pathRewrite: { '^/toniq_io': '/' },
        },
      ],
    };

    return config;
  }
);

module.exports = config;

