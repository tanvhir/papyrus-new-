import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'motion/react'],
            'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
            'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder'],
            'features-study': ['./src/components/study/StudySession', './src/components/study/StudySessionCard', './src/components/study/StudySessionResults'],
            'features-settings': ['./src/components/settings/SettingsModal', './src/components/settings/AISettings', './src/components/settings/AppearanceSettings', './src/components/settings/PageSettings', './src/components/settings/EditorSettings'],
            'features-help': ['./src/components/help/HelpCenter', './src/components/help/HelpNavigation', './src/components/help/HelpContent'],
          },
        },
        onwarn(warning, warn) {
          // Ignore circular dependency warnings
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            return;
          }
          warn(warning);
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
