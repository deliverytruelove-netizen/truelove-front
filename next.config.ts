/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    // Puedes agregar otras variables aquí si quieres que estén disponibles en el cliente
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'magusemail.com',
        pathname: '/arequipago-back/public/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      }
    ],
  },
  // Configuración de webpack sin tipado explícito
  webpack: (
    // @ts-expect-error: Config parameter is not explicitly typed
    config,
    // @ts-expect-error: Context parameter is not explicitly typed
    { isServer }
  ) => {
    // Este fallback permite que pdfjs-dist funcione sin el módulo canvas
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        canvas: false,
        fs: false,
        path: false,
      },
    };

    // Configuración adicional para react-pdf
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Excluir librerías del navegador del bundle del servidor
    if (isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      if (Array.isArray(config.externals)) {
        config.externals.push('@mediapipe/tasks-vision');
        config.externals.push('dynamsoft-document-normalizer');
        config.externals.push('mapbox-gl');
        config.externals.push('canvas');
      }
    }

    return config;
  },
  async rewrites() {
    // Extraer la base URL de NEXT_PUBLIC_API_WEB
    // Elimina "/api" del final si existe
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_WEB 
      ? process.env.NEXT_PUBLIC_API_WEB.replace(/\/api$/, '')
      : 'http://localhost:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${apiBaseUrl}/storage/:path*`,
      },
      {
        source: '/logos-negocio/:path*',
        destination: `${apiBaseUrl}/logos-negocio/:path*`,
      },
      {
        source: '/fotos-perfil/:path*',
        destination: `${apiBaseUrl}/fotos-perfil/:path*`,
      },
    ];
  },
};

export default nextConfig;

