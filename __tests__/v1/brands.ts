// tslint:disable: no-shadowed-variable

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
})

test('should create brand and be accessible', async () => {
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
  expect(rb.data.brands.filter((rb) => rb.id === brand.id)).toHaveLength(1)

  // list my personnal brands
  const mb = await api.listMyBrands()
  expect(mb.data.brands).toHaveLength(0)
})

test('should associate a user to a brand', async () => {
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

test('should create brand with logs', async () => {
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

  const abrands = await api.getBrandLogs(brand.id)
  expect(abrands.data.logs).toHaveLength(1)

  const log = abrands.data.logs[0]
  expect(log.user.id).toBe(admin.user.id)
  expect(log.action).toBe('create')

  // create a user
  const user = await testhelpers.createLoginUser(testhelpers.getBasePath(srv))

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

  const abrands2 = await api.getBrandLogs(brand.id)
  expect(abrands2.data.logs).toHaveLength(2)

  const log2 = abrands2.data.logs[1]
  expect(log2.user.id).toBe(admin.user.id)
  expect(log2.action).toBe('update')
})

test('should create brand and invite user that doesnt exists', async () => {
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

  const inv = await api.inviteUser(brand.id, {
    email: faker.internet.email(),
  })

  expect(inv.data.message).toBe('onboarding sent')
})

test('should create brand and invite user who already signed up', async () => {
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

  const inv = await api.inviteUser(brand.id, {
    email: admin.user.email,
  })

  expect(inv.data.message).toBe('user added')
})
