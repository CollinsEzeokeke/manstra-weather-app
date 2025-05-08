/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle markdown files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      include: /node_modules/,
      type: 'javascript/auto',
      use: 'null-loader',
    });

    // Handle LICENSE files
    config.module.rules.push({
      test: /LICENSE$/,
      include: /node_modules/,
      type: 'javascript/auto',
      use: 'null-loader',
    });

    // Handle specifically the @libsql package files
    config.module.rules.push({
      test: /\.(md|txt|LICENSE)$/,
      include: [
        /node_modules\/.pnpm\/@libsql/,
        /node_modules\/@libsql/,
        /node_modules\/.pnpm\/libsql/,
        /node_modules\/libsql/,
      ],
      use: 'null-loader',
    });

    // Properly exclude native .node files from processing
    if (isServer) {
      // Prevent webpack from attempting to bundle native modules
      config.externals = [
        ...(config.externals || []),
        'sqlite3',
        'better-sqlite3',
        '@libsql/win32-x64-msvc',
        '@libsql/darwin-arm64',
        '@libsql/darwin-x64',
        '@libsql/linux-arm64-gnu',
        '@libsql/linux-arm64-musl',
        '@libsql/linux-x64-gnu',
        '@libsql/linux-x64-musl',
        'libsql'
      ];
    }

    // This is necessary to tell webpack not to try to bundle .node files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libsql/win32-x64-msvc/index.node': false,
      '@libsql/client/README.md': false,
      '@libsql/hrana-client/LICENSE': false,
    };

    return config;
  },
  // Disable image optimization during development to avoid issues
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  }
};

module.exports = nextConfig; 