import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgres://questlog:questlog@localhost:5432/questlog_test',
      JWT_SECRET: 'segredo-de-teste-com-tamanho-suficiente',
      NODE_ENV: 'test'
    },
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false
  }
})
