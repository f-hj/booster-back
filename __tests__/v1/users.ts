import faker = require('faker')
import net = require('net')
import { UsersApi } from '../../oa-ts-axios'
import testhelpers from '../../testhelpers/start'

let srv: net.Server
let api: UsersApi

beforeAll(async () => {
  srv = await testhelpers.start()
  api = new UsersApi({
    basePath: testhelpers.getBasePath(srv),
  })
})

afterAll(async () => {
  if (srv) {
    srv.close()
  }
})

test('createUser OK', async () => {
  const email = faker.internet.email()
  const res = await api.createUser({
    user: {
      name: faker.name.findName(),
      password: faker.internet.password(),
      email,
    },
  })

  const user = res.data.user

  expect(user.email).toBe(email)
  expect(user.password).toBe(undefined)

  // try to find in listUser func
  const r = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const userAdminApi = new UsersApi({
    basePath: testhelpers.getBasePath(srv),
    accessToken: r.token,
  })

  const rusrs = await userAdminApi.listUsers()
  let found = false
  for (const u of rusrs.data.users) {
    if (u.id === user.id) {
      found = true
      break
    }
  }

  const usr = await userAdminApi.getUser(user.id)
  expect(usr.data.user.id).toBe(user.id)

  expect(usr.data.logs).toHaveLength(1)

  const log = usr.data.logs[0]
  expect(log.action).toBe('create')
  expect(log.refType).toBe('user')

  expect(found).toBe(true)
})

test('createUser without email must fail', async (done) => {
  try {
    await api.createUser({
      user: {
        name: faker.name.findName(),
        password: faker.internet.password(),
        email: 'bla',
      },
    })
  } catch (e) {
    expect(e.response.status).toBe(401)
    expect(e.response.data.errors.length).toBe(1)
    expect(e.response.data.errors[0].type).toBe('validation')
    expect(e.response.data.errors[0].property).toBe('email')
    done()
  }
})

test('create login and fetch user', async () => {
  const name = faker.name.findName()
  const email = faker.internet.email()
  const password = faker.internet.password()
  const res = await api.createUser({
    user: {
      name,
      password,
      email,
    },
  })

  expect(res.data.user.email).toBe(email)
  expect(res.data.user.password).toBe(undefined)

  const login = await api.loginUser({
    email,
    password,
  })
  expect(login.data.user.isAdmin).toBe(false)

  const loggedApi = new UsersApi({
    basePath: testhelpers.getBasePath(srv),
    accessToken: login.data.token,
  })

  const usr = await loggedApi.getMyself()
  expect(usr.data.user.name).toBe(name)
})

test('shouldnt login with incorrect email', async () => {
  try {
    await api.loginUser({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })
  } catch (e) {
    expect(e.response.status).toBe(401)
  }
})

test('shouldnt login with incorrect password', async () => {
  const email = faker.internet.email()
  const password = faker.internet.password()
  const res = await api.createUser({
    user: {
      name: faker.name.findName(),
      password,
      email,
    },
  })

  expect(res.data.user.email).toBe(email)
  expect(res.data.user.password).toBe(undefined)

  try {
    await api.loginUser({
      email,
      password: faker.internet.password(),
    })
  } catch (e) {
    expect(e.response.status).toBe(401)
  }
})
