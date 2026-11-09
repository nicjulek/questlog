import { pool } from './client'
import { migrate } from './migrate'

migrate()
  .then(() => console.log('Banco atualizado.'))
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
