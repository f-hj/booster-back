import faker = require('faker')
import net = require('net')
import os = require('os')
import path = require('path')
import { createConnection } from 'typeorm'
import createAPI from '../api'
import entities from '../entities'
import { UsersApi } from '../oa-ts-axios'

const getBasePath = (server: net.Server) => {
  if (server.address() as net.AddressInfo) {
    return `http://localhost:${(server.address() as net.AddressInfo).port}`
  }
}

export default {
  start: async () =>  {
    const connection =  await createConnection({
      type: 'sqlite',
      database: path.join(os.tmpdir(), `booster_sqlite_${Date.now()}.db`),
      entities,
      synchronize: true,
    })

    const app = await createAPI(connection)
    const server = app.listen(process.env.PORT)
    return server
  },
  createLoginUser: async (basePath: string) => {
    const usersApi = new UsersApi({
      basePath,
    })
    const name = faker.name.findName()
    const email = faker.internet.email()
    const password = faker.internet.password()
    const res = await usersApi.createUser({
      user: {
        name,
        password,
        email,
      },
    })

    expect(res.data.user.email).toBe(email)
    expect(res.data.user.password).toBe(undefined)

    const login = await usersApi.loginUser({
      email,
      password,
    })
    expect(login.data.user.isAdmin).toBe(false)

    return login.data
  },
  getBasePath,
}
