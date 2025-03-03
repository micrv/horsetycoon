import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    base: '/horsetycoon/',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    if (/\.(mp3|wav|ogg)$/i.test(assetInfo.name)) {
                        return `assets/Sound/[name][extname]`;
                    }
                    return `assets/[name]-[hash][extname]`;
                },
                format: 'es'
            }
        }
    },
    publicDir: 'assets',
    resolve: {
        alias: {
            '@': resolve(__dirname, './js'),
            '@assets': resolve(__dirname, './assets')
        }
    },
    optimizeDeps: {
        include: ['js/**/*.js']
    }
}); 