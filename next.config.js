/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  experimental: {
    // Enable modern bundling
    esmExternals: true,
    // Enable optimized CSS
    optimizeCss: true,
    // Enable optimized imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable server components
    serverComponentsExternalPackages: ['mongoose'],
    // Enable optimized server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'revolutionnetwork.com'],
    },
  },

  // Image Optimization
  images: {
    domains: [
      'localhost',
      'revolutionnetwork.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'res.cloudinary.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Bundle Analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analysis.html',
          })
        );
      }
      return config;
    },
  }),

  // Webpack Configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Performance optimizations
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add performance monitoring
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      })
    );

    return config;
  },

  // Headers for Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sw-advanced.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
    ];
  },

  // Redirects for Performance
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: true,
      },
    ];
  },

  // Rewrites for Performance
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health/check',
      },
    ];
  },

  // Environment Variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output Configuration
  output: 'standalone',

  // Trailing Slash
  trailingSlash: false,

  // Powered By Header
  poweredByHeader: false,

  // React Strict Mode
  reactStrictMode: true,

  // SWC Minify
  swcMinify: true,

  // Modularize Imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Transpile Packages
  transpilePackages: ['@radix-ui/react-icons'],

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // PWA Configuration
  ...(process.env.NODE_ENV === 'production' && {
    pwa: {
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: false,
      buildExcludes: [/middleware-manifest\.json$/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 24 * 60 * 60, // 1 day
            },
          },
        },
      ],
    },
  }),

  // Performance Budget
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000, // 500KB
  },

  // Experimental Features
  experimental: {
    // Enable modern bundling
    esmExternals: true,
    // Enable optimized CSS
    optimizeCss: true,
    // Enable optimized imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable server components
    serverComponentsExternalPackages: ['mongoose'],
    // Enable optimized server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'revolutionnetwork.com'],
    },
    // Enable optimized server components
    serverComponentsExternalPackages: ['mongoose'],
    // Enable optimized imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable modern bundling
    esmExternals: true,
    // Enable optimized CSS
    optimizeCss: true,
  },
};

module.exports = nextConfig;
