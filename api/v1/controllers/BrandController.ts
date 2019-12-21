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

    router.post('/', chAT, this.createBrand.bind(this))
    router.get('/:brandId', this.getBrand.bind(this))
    router.patch('/:brandId', chAT, this.updateBrand.bind(this))
    router.delete('/:brandId', chAT, this.deleteBrand.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/brands/:
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
 * /v1/brands/{brandId}:
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
 * /v1/brands/{brandId}:
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
    const brand: Brand = req.body.brand
    await this.repo.save(brand)
    res.json({
      success: true,
      brand,
    })
  }

/**
 * @swagger
 * /v1/brands/{brandId}:
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
    await this.repo.delete(req.params.brandId)
    res.json({
      success: true,
    })
  }

}
