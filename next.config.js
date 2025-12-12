/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['pt', 'fr', 'en'],
    defaultLocale: 'pt',
  },
};

module.exports = nextConfig;
