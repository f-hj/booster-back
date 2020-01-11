import { validateOrReject } from 'class-validator'
import express = require('express')
import { Connection, Repository } from 'typeorm'
import Log, { Action, RefType } from '../../../entities/Log'
import Product from '../../../entities/Product'
import atMw from '../middlewares/accessToken'

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products controller
 */

export default class ProductController {

  private c: Connection
  private repo: Repository<Product>
  private logRepo: Repository<Log>

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(Product)
    this.logRepo = c.getRepository(Log)
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    const chAT = atMw.checkAccessToken(this.c)

    router.get('/product/:productId', this.getProduct.bind(this))
    router.get('/productLogs/:productId', chAT, this.getProductLogs.bind(this))
    router.get('/brand/:brandId', this.listBrandProducts.bind(this))
    router.post('/product', chAT, this.createProduct.bind(this))
    router.patch('/product/:productId', chAT, this.updateProduct.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/products/product/${productId}:
 *   get:
 *     summary: Get current product
 *     operationId: getProduct
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 */
  private async getProduct(req: express.Request, res: express.Response) {
    const product = await this.repo.findOne({
      id: req.params.productId,
    }, {
      relations: ['brand', 'models', 'images'],
    })

    res.json({
      product,
    })
  }

/**
 * @swagger
 * /v1/products/productLogs/${productId}:
 *   get:
 *     summary: Get current product with logs
 *     operationId: getProductLogs
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 */
private async getProductLogs(req: express.Request, res: express.Response) {
  const product = await this.repo.findOne({
    id: req.params.productId,
  }, {
    relations: ['brand', 'models', 'images'],
  })

  const logs = await this.logRepo.find({
    where: {
      refType: RefType.product,
      refId: product.id,
    },
    relations: ['user'],
  })

  res.json({
    product,
    logs,
  })
}

/**
 * @swagger
 * /v1/products/brand/${brandId}:
 *   get:
 *     summary: Get current product
 *     operationId: listBrandProducts
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
  private async listBrandProducts(req: express.Request, res: express.Response) {
    const products = await this.repo.find({
      brand: {
        id: req.params.brandId,
      },
    })

    res.json({
      products,
    })
  }

/**
 * @swagger
 * /v1/products/product:
 *   post:
 *     summary: Create a product
 *     operationId: createProduct
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async createProduct(req: express.Request, res: express.Response, next: express.NextFunction) {
    const product = this.repo.create(req.body.product as Product)

    // TODO: check that brand exists, needed?
    // TODO: check that user can access to this brand

    try {
      await validateOrReject(product)
    } catch (e) {
      return next(e)
    }

    try {
      await this.repo.save(product)
    } catch (e) {
      return next(e)
    }

    res.json({
      success: true,
      product,
    })

    const log = this.logRepo.create({
      action: Action.create,
      refType: RefType.product,
      refId: product.id,
      user: req.context?.user,
      to: product,
    } as Log)
    await this.logRepo.save(log)
  }

/**
 * @swagger
 * /v1/products/product/{productId}:
 *   patch:
 *     summary: Update a product
 *     operationId: updateProduct
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 */
private async updateProduct(req: express.Request, res: express.Response) {
  const product = this.repo.create(req.body.product as Product)
  product.id = req.params.productId

  await this.repo.save(product)
  res.json({
    success: true,
    product,
  })

  const log = this.logRepo.create({
    action: Action.update,
    refType: RefType.product,
    refId: product.id,
    user: req.context?.user,
    to: product,
  } as Log)
  await this.logRepo.save(log)
}

}
