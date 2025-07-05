const withTM = require('next-transpile-modules')(['@0glabs/0g-ts-sdk']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  serverExternalPackages: [
    '@0glabs/0g-ts-sdk',
    'crypto',
    'fs',
    'stream',
    'buffer',
    'util',
    'assert',
    'http',
    'https',
    'os',
    'url',
    'path',
  ],
  
  // Bundle analysis
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
  
  // Compression
  compress: true,
  
  // Performance optimizations
  poweredByHeader: false,
  
  env: {
    NEXT_PUBLIC_COMPUTE_API_URL: process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_DREAM_TEST: process.env.NEXT_PUBLIC_DREAM_TEST || 'true',
  },
  
  webpack: (config, { isServer }) => {
    // CSS loader configuration for RainbowKit
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });

    // NodePolyfillPlugin for client-side
    if (!isServer) {
      const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
      config.plugins.push(new NodePolyfillPlugin());
    }

    // Node.js polyfills - complete fallback configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      'node:fs': false,
      'node:fs/promises': false,
      'node:crypto': require.resolve('crypto-browserify'),
      'node:stream': require.resolve('stream-browserify'),
      'node:buffer': require.resolve('buffer'),
      'node:util': require.resolve('util'),
      'node:assert': require.resolve('assert'),
      'node:http': require.resolve('stream-http'),
      'node:https': require.resolve('https-browserify'),
      'node:os': require.resolve('os-browserify/browser'),
      'node:url': require.resolve('url'),
      'node:path': require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      path: require.resolve('path-browserify'),
    };

    // Webpack plugins
    config.plugins.push(
      new (require('webpack')).ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    // Node.js module aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': 'crypto-browserify',
      'node:fs': false,
      'node:fs/promises': false,
      'node:stream': 'stream-browserify',
      'node:buffer': 'buffer',
      'node:util': 'util',
      'node:assert': 'assert',
      'node:http': 'stream-http',
      'node:https': 'https-browserify',
      'node:os': 'os-browserify/browser',
      'node:url': 'url',
      'node:path': 'path-browserify',
    };

    // Module resolution rules
    config.module.rules.push({
      test: /\.(m?js|ts|tsx)$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Node.js module replacement - kluczowe dla node: prefix
    config.plugins.push(
      new (require('webpack')).NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );

    return config;
  },
}

module.exports = withTM(nextConfig); 