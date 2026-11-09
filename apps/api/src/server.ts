import { env } from './env'
import { createApp } from './app'
import { migrate } from './db/migrate'

migrate()
  .then(() => createApp().listen(env.PORT, () => console.log(`API do Questlog em http://localhost:${env.PORT}`)))
  .catch((err) => {
    console.error('Não foi possível preparar o banco. Confira DATABASE_URL em apps/api/.env.', err)
    process.exit(1)
  })
