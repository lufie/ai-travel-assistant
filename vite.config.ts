import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 加载环境变量，添加安全检查
    const env = {
        @VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || '',
        @VITE_SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
        @VITE_DOUBAO_API_KEY: import.meta.env?.VITE_DOUBAO_API_KEY || '',
    };

    console.log('=== Vite 环境变量检查 ===');
    console.log('Supabase URL:', env.VITE_SUPABASE_URL ? '已配置' : '未配置');
    console.log('API Key exists:', !!env.VITE_DOUBAO_API_KEY);

    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.@VITE_SUPABASE_URL': JSON.stringify(env.@VITE_SUPABASE_URL),
        'process.env.@VITE_SUPABASE_ANON_KEY': JSON.stringify(env.@VITE_SUPABASE_ANON_KEY),
        'process.env.@VITE_DOUBAO_API_KEY': JSON.stringify(env.@VITE_DOUBAO_API_KEY)
      },
      build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // 将大型依赖单独打包
              if (id.includes('node_modules')) {
                // Leaflet 地图库
                if (id.includes('leaflet')) {
                  return 'leaflet';
                }
                // Supabase
                if (id.includes('@supabase')) {
                  return 'supabase';
                }
                // Google AI
                if (id.includes('@google/genai')) {
                  return 'google-ai';
                }
                // React 核心库
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                // 其他 node_modules
                return 'vendor';
              }
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});