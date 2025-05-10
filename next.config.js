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

    // For server-side only - prevent webpack from attempting to bundle native modules
    if (isServer) {
      // Properly exclude native modules from processing
      config.externals = [
        ...(config.externals || []),
        'sqlite3',
        'better-sqlite3',
        '@libsql/client',
        'libsql',
      ];
      
      // Remove 'libsql' from externals to ensure it's properly bundled
    }

    // This is necessary to tell webpack not to try to bundle .node files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libsql/win32-x64-msvc/index.node': false,
      '@libsql/client/README.md': false,
      '@libsql/hrana-client/LICENSE': false,
    };

    // Add a specific rule for .node binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
      exclude: /node_modules/,
    });

    return config;
  },
  // Disable image optimization during development to avoid issues
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Add transpilePackages to ensure proper bundling of native dependencies
  transpilePackages: ['libsql', '@libsql/client', '@mastra/libsql']
};

module.exports = nextConfig; 