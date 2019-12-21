import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import createAPI from './api'
import config from './config'
import entities from './entities'

let connectionConfig: ConnectionOptions = {
  type: 'sqlite',
  database: './sqlite.db',
  entities,
  synchronize: true,
}

if (config.postgres.active) {
  const pg = config.postgres

  connectionConfig = {
    type: 'postgres',
    url: `postgres://${pg.user}:${pg.password}@${pg.host}/${pg.database}`,
    entities,
    synchronize: true,
  }
}

createConnection(connectionConfig).then(async (connection) => {
  const app = await createAPI(connection)
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Ready & listening', server.address())
  })
}).catch((error) => console.log(error))
