import faker = require('faker')
import net = require('net')
import { BrandsApi, ProductsApi } from '../../oa-ts-axios'
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

test('shouldnt create product if brand doesnt exists', async () => {
  const admin = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const api = new ProductsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))

  try {
    await api.createProduct({})
  } catch (e) {
    expect(e.response.data.errors).toHaveLength(1)
  }
})

test('should list product for an empty brand', async () => {
  const admin = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const brandApi = new BrandsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))
  const brandName = faker.company.companyName()

  // create a brand
  const res = await brandApi.createBrand({
    brand: {
      name: brandName,
    },
  })

  const brand = res.data.brand!

  const api = new ProductsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))

  const ps = await api.listBrandProducts(brand.id)
  expect(ps.data.products).toHaveLength(0)
})

test('shoudld create a product for a brand', async () => {
  const admin = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const brandApi = new BrandsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))
  const brandName = faker.company.companyName()

  // create a brand
  const res = await brandApi.createBrand({
    brand: {
      name: brandName,
    },
  })

  const brand = res.data.brand!

  const api = new ProductsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))

  const productName = faker.lorem.words()
  const productDescription = faker.lorem.paragraph()

  const p = await api.createProduct({
    product: {
      brand,
      name: productName,
      description: productDescription,
      currency: 'EUR',
      price: 500, // 5 euros
    },
  })

  expect(p.data.product.name).toBe(productName)
  expect(p.data.product.description).toBe(productDescription)

  const ps = await api.listBrandProducts(brand.id)
  expect(ps.data.products).toHaveLength(1)
})
