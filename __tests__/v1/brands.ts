import faker = require('faker')
import net = require('net')
import { BrandsApi, UsersApi } from '../../oa-ts-axios'
import testhelpers from '../../testhelpers/start'

let srv: net.Server

beforeAll(async () => {
  srv = await testhelpers.start()
})

afterAll(async () => {
  if (srv) {
    srv.close()
  }
})

test('should create brand', async () => {
  const l = await testhelpers.createLoginUser(testhelpers.getBasePath(srv))
  const api = new BrandsApi({
    accessToken: l.token,
  }, testhelpers.getBasePath(srv))
  const brandName = faker.company.companyName()
  const res = await api.createBrand({
    brand: {
      name: brandName,
    },
  })

  expect(res.data.brand.name).toBe(brandName)
})
