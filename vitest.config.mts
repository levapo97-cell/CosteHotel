import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// El motor de costeo es dominio puro (sin React), así que las pruebas corren en Node
// sin la configuración de Next. El alias '@' replica el de tsconfig.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
