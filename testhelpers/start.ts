import faker = require('faker')
import net = require('net')
import os = require('os')
import path = require('path')
import { Connection, createConnection } from 'typeorm'
import createAPI from '../api'
import entities from '../entities'
import User from '../entities/User'
import { UsersApi } from '../oa-ts-axios'

const getBasePath = (server: net.Server) => {
  if (server.address() as net.AddressInfo) {
    return `http://localhost:${(server.address() as net.AddressInfo).port}`
  }
}

class StartTestHelper {

  public getBasePath = getBasePath

  private connection: Connection

  public start = async () =>  {
    // tslint:disable-next-line: no-bitwise
    const dbPath = path.join(os.tmpdir(), `booster_sqlite_${(Math.random() * 0xFFFFFF << 0).toString(16)}.db`)
    console.log('Start db to', dbPath)
    this.connection = await createConnection({
      type: 'sqlite',
      database: dbPath,
      entities,
      synchronize: true,
    })

    const app = await createAPI(this.connection)
    const server = app.listen(process.env.PORT)
    return server
  }

  public createLoginAdmin = async (basePath: string) => {
    const ld = await this.createLoginUser(basePath)
    const usrRepo = this.connection.getRepository(User)
    await usrRepo.update({
      id: ld.user.id,
    }, {
      isAdmin: true,
    })

    return ld
  }

  public createLoginUser = async (basePath: string) => {
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
  }
}

export default new StartTestHelper()
