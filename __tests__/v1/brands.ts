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
  const admin = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const api = new BrandsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))
  const brandName = faker.company.companyName()

  // create a brand
  const res = await api.createBrand({
    brand: {
      name: brandName,
    },
  })

  const brand = res.data.brand!
  expect(brand.name).toBe(brandName)

  // list all public brands
  const rb = await api.listBrands()
  expect(rb.data.brands).toHaveLength(1)

  // list my personnal brands
  const mb = await api.listMyBrands()
  expect(mb.data.brands).toHaveLength(0)

  // create a user
  const user = await testhelpers.createLoginUser(testhelpers.getBasePath(srv))
  const userBrandApi = new BrandsApi({
    accessToken: user.token,
  }, testhelpers.getBasePath(srv))
  const userUserApi = new UsersApi({
    accessToken: user.token,
  }, testhelpers.getBasePath(srv))

  // associate a user to this brand
  const bures = await api.updateBrand(brand.id, {
    brand: {
      name: brandName,
      users: [
        {
          id: user.user.id,
        },
      ],
    },
  })
  expect(bures.data.success).toBe(true)

  // list my personnal brands
  const mb2 = await api.listMyBrands()
  expect(mb2.data.brands).toHaveLength(0)

  // he should access to its brand throug brand api
  const uBBrands = await userBrandApi.listMyBrands()
  expect(uBBrands.data.brands).toHaveLength(1)

  // he should access to its brand throug user api
  const uBrands = await userUserApi.getMyself()
  expect(uBrands.data.user.brands).toHaveLength(1)
})
