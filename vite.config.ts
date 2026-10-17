import { defineConfig } from 'vite'

// base './' keeps every asset path relative, so the build works on
// username.github.io/any-repo-name without editing anything.
export default defineConfig({
  base: './',
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
})
