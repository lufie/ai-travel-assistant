import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 加载环境变量，添加安全检查
    const env = {
        VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || '',
        VITE_SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
        VITE_DOUBAO_API_KEY: import.meta.env?.VITE_DOUBAO_API_KEY || '',
    };

    console.log('=== Vite 环境变量检查 ===');
    console.log('Supabase URL:', env.VITE_SUPABASE_URL ? '已配置' : '未配置');
    console.log('API Key exists:', !!env.VITE_DOUBAO_API_KEY);

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.VITE_DOUBAO_API_KEY': JSON.stringify(env.VITE_DOUBAO_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});