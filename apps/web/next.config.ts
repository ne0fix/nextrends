import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@nextface/domain',
    '@nextface/application',
    '@nextface/schemas',
    '@nextface/ui',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  // Garante que credenciais de DB nunca vazem para o bundle do cliente
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
