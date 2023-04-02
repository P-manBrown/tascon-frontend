/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  // Refer to https://github.com/GoogleChrome/workbox/issues/1790
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
})

module.exports = withPWA({
  reactStrictMode: true,
})
