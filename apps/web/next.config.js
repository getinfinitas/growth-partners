const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  
  experimental: {
    optimizePackageImports: ['@infinitas/ui', '@infinitas/shared'],
  },
  
  serverExternalPackages: ['@supabase/supabase-js'],
  
  transpilePackages: ['@infinitas/ui', '@infinitas/shared'],
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    org: "infinitas",
    project: "javascript-nextjs",
    
    silent: !process.env.CI,
    disableLogger: true,
    
    // Disable source map uploads in development for faster builds
    uploadSourceMaps: process.env.NODE_ENV === 'production',
    widenClientFileUpload: false,
  }
);
