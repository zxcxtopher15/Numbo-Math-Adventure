import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler', { target: '18' }]],
            },
        }),
        
    ],
    server: {
        watch: {
          usePolling: true, // Fixes auto-reloading issues on some systems
        },
        hmr: {
          host: 'numbo-math-adventure.test', // Adjust if using Docker/WSL
        },
      },
});
