import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the build works from any path (e.g. the portfolio's property subdomain)
export default defineConfig({
  plugins: [react()],
  base: './',
});
