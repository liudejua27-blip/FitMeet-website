/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    const developmentScriptPolicy = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
    const configuredApiBase = process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL;
    const developmentConnectOrigins = (() => {
      if (process.env.NODE_ENV !== 'development' || !configuredApiBase) return '';
      try {
        const apiUrl = new URL(configuredApiBase);
        const websocketUrl = new URL(apiUrl.origin);
        websocketUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        return ` ${apiUrl.origin} ${websocketUrl.origin}`;
      } catch {
        return '';
      }
    })();
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${developmentScriptPolicy}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src 'self' https://api.fitmeet.cn wss://api.fitmeet.cn${developmentConnectOrigins}`,
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      'upgrade-insecure-requests',
    ].join('; ');

    const privateEmailActionHeaders = [
      { key: 'Cache-Control', value: 'no-store, private, max-age=0, must-revalidate' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
    ];

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          // Keep HSTS scoped to the website host until every future subdomain
          // has an independently verified HTTPS service.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      { source: '/auth/email/verify', headers: privateEmailActionHeaders },
      { source: '/auth/password/forgot', headers: privateEmailActionHeaders },
      { source: '/auth/password/reset', headers: privateEmailActionHeaders },
      { source: '/api/auth/email/:path*', headers: privateEmailActionHeaders },
      { source: '/api/auth/password/:path*', headers: privateEmailActionHeaders },
    ];
  },
};

export default nextConfig;
