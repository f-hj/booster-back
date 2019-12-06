import { Connection, createConnection } from 'typeorm'
import createAPI from './api'
import entities from './entities'

createConnection({
  type: 'sqlite',
  database: './sqlite.db',
  entities,
  synchronize: true,
}).then(async (connection) => {
  const app = await createAPI(connection)
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Ready & listening', server.address())
  })
}).catch((error) => console.log(error))
