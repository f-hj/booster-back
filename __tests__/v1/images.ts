// tslint:disable: no-shadowed-variable

import faker = require('faker')
import net = require('net')
import { BrandsApi, ImagePriorityEnum, ImagesApi, ProductsApi } from '../../oa-ts-axios'
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

test('should create brand, product and upload image', async () => {
  const admin = await testhelpers.createLoginAdmin(testhelpers.getBasePath(srv))
  const brandsApi = new BrandsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))
  const brandName = faker.company.companyName()

  // create a brand
  const res = await brandsApi.createBrand({
    brand: {
      name: brandName,
    },
  })

  const brand = res.data.brand!
  expect(brand.name).toBe(brandName)

  const productsApi = new ProductsApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))

  const productName = faker.lorem.words()
  const productDescription = faker.lorem.paragraph()

  const p = await productsApi.createProduct({
    product: {
      brand,
      name: productName,
      description: productDescription,
      currency: 'EUR',
      price: 500, // 5 euros
    },
  })

  const product = p.data.product

  const api = new ImagesApi({
    accessToken: admin.token,
  }, testhelpers.getBasePath(srv))

  const imgName = faker.lorem.sentence()
  const img = await api.productImageUpload(product.id, {
    name: imgName,
    content: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  })

  expect(img.data.image.name).toBe(imgName)

  const imgD = await api.getImage(img.data.image.id)
  expect(imgD.headers['content-type']).toBe('image/gif')
  expect(imgD.data).toBeDefined()

  const np = await productsApi.getProduct(product.id)
  expect(np.data.product.images).toHaveLength(1)

  const imgp = np.data.product.images[0]
  expect(imgp.name).toBe(imgName)

  const newName = faker.lorem.sentence()
  const n = await api.updateImage(img.data.image.id, {
    image: {
      name: newName,
      priority: ImagePriorityEnum.Primary,
    },
  })

  expect(n.data.image.name).toBe(newName)

  const d = await api.deleteImage(img.data.image.id)
  expect(d.data.success).toBe(true)
})
