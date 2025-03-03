import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    base: '/',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            },
            output: {
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const extType = info[info.length - 1];
                    if (/\.(mp3|wav|ogg)$/i.test(assetInfo.name)) {
                        return `assets/Sound/[name][extname]`;
                    }
                    return `assets/[name]-[hash][extname]`;
                }
            }
        }
    },
    publicDir: 'assets',
    resolve: {
        alias: {
            '@': resolve(__dirname, './js'),
            '@assets': resolve(__dirname, './assets')
        }
    }
}); 