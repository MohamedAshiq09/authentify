/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Handle polkadot.js dependencies
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };

        return config;
    },
    // Enable source maps in development
    productionBrowserSourceMaps: false,

    // Optimize images
    images: {
        domains: [],
    },
}

module.exports = nextConfig