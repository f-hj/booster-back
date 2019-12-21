import { validateOrReject } from 'class-validator'
import express = require('express')
import { Connection, Repository } from 'typeorm'
import Brand from '../../../entities/Brand'
import atMw from '../middlewares/accessToken'

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brands management
 */

export default class BrandController {

  private c: Connection
  private repo: Repository<Brand>

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(Brand)
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    const chAT = atMw.checkAccessToken(this.c)

    router.get('/brands', this.listBrands.bind(this))
    router.post('/brand', chAT, atMw.onlyAdmin(), this.createBrand.bind(this))
    router.get('/brand/:brandId', this.getBrand.bind(this))
    router.patch('/brand/:brandId', chAT, this.updateBrand.bind(this))
    router.delete('/brand/:brandId', chAT, this.deleteBrand.bind(this))
    router.get('/myBrands', chAT, this.listMyBrands.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/brands/brands:
 *   get:
 *     summary: List all brands
 *     operationId: listBrands
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Brands
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async listBrands(req: express.Request, res: express.Response) {
    const brands = await this.repo.find()
    return res.json({
      brands,
    })
  }

/**
 * @swagger
 * /v1/brands/brand:
 *   post:
 *     summary: Create a brand
 *     operationId: createBrand
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Brands
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: object
 *                 $ref: '#/components/schemas/Brand'
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
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async createBrand(req: express.Request, res: express.Response, next: express.NextFunction) {
    const brand = this.repo.create(req.body.brand as Brand)

    try {
      await validateOrReject(brand)
    } catch (e) {
      return next(e)
    }

    try {
      await this.repo.save(brand)
    } catch (e) {
      return next(e)
    }

    res.json({
      success: true,
      brand: brand.JSON(),
    })
  }

/**
 * @swagger
 * /v1/brands/brand/{brandId}:
 *   get:
 *     summary: Get a brand
 *     operationId: getBrand
 *     tags:
 *       - Brands
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
 *                 success:
 *                   type: boolean
 *                 brand:
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 */
  private async getBrand(req: express.Request, res: express.Response) {
    const brand = this.repo.find({
      id: req.params.brandId,
    })
    res.json({
      brand,
    })
  }

/**
 * @swagger
 * /v1/brands/brand/{brandId}:
 *   patch:
 *     summary: Update a brand
 *     operationId: updateBrand
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: path
 *         name: brandId
 *         schema:
 *           type: string
 *         required: true
 *         description: Brand ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: object
 *                 $ref: '#/components/schemas/Brand'
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
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 */
  private async updateBrand(req: express.Request, res: express.Response) {
    // TODO: if user not admin check if brand owner
    const brand = this.repo.create(req.body.brand as Brand)
    brand.id = req.params.brandId

    await this.repo.save(brand)
    res.json({
      success: true,
      brand,
    })
  }

/**
 * @swagger
 * /v1/brands/brand/{brandId}:
 *   delete:
 *     summary: Delete a brand
 *     operationId: deleteBrand
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Brands
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
 *                 success:
 *                   type: boolean
 */
  private async deleteBrand(req: express.Request, res: express.Response) {
    // TODO: if user not admin check if brand owner
    await this.repo.delete(req.params.brandId)
    res.json({
      success: true,
    })
  }

/**
 * @swagger
 * /v1/brands/myBrands:
 *   get:
 *     summary: List my brands
 *     operationId: listMyBrands
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Brands
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async listMyBrands(req: express.Request, res: express.Response) {
    console.log('userid', req.context.user.id)
    const brands = await this.repo
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.users', 'user')
      .where('user.id = :id', { id: req.context.user.id })
      .getMany()

    res.json({
      brands,
    })
  }

}
