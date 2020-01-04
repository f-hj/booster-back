import express = require('express')
import { extension, lookup } from 'mime-types'
import minio = require('minio')
import { Connection, Repository } from 'typeorm'
import config from '../../../config'
import Image from '../../../entities/Image'
import Log, { Action, RefType } from '../../../entities/Log'
import Product from '../../../entities/Product'

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Images management
 */

export default class ImagesController {

  private c: Connection
  private repo: Repository<Image>
  private logRepo: Repository<Log>
  private productRepo: Repository<Product>

  private s3: minio.Client

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(Image)
    this.logRepo = c.getRepository(Log)
    this.productRepo = c.getRepository(Product)

    this.s3 = new minio.Client({
      endPoint: config.imagesS3.endPoint,
      region: config.imagesS3.region,
      accessKey: config.imagesS3.accessKey,
      secretKey: config.imagesS3.secretKey,
      port: config.imagesS3.port,
      useSSL: config.imagesS3.useSSL,
    })
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    router.get('/image/:imageId', this.getImage.bind(this))
    router.post('/product/:productId', this.productImageUpload.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/images/image/${imageId}:
 *  get:
 *    summary: Get an image from id
 *    operationId: getImage
 *    tags:
 *      - Images
 *    parameters:
 *      - in: path
 *        name: imageId
 *        schema:
 *          type: string
 *        required: true
 *        description: Image ID
 *    responses:
 *      200:
 *        description: Image
 */
  private async getImage(req: express.Request, res: express.Response, next: express.NextFunction) {
    const image = await this.repo.findOneOrFail({
      id: req.params.imageId,
    })
    res.type(image.type)
    const exten = extension(image.type)

    const stream = await this.s3.getObject(config.imagesS3.bucket, `${image.id}.${exten}`)
    stream.on('data', (data) => {
      res.write(data)
    })
    stream.on('end', () => {
      res.end()
    })
  }

/**
 * @swagger
 * /v1/images/product/${productId}:
 *   post:
 *     summary: Post an image for a product
 *     operationId: productImageUpload
 *     tags:
 *       - Images
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
 *               name:
 *                 type: string
 *                 description: Display name
 *               content:
 *                 type: string
 *                 description:
 *                   "Base64 encoded image with header (eg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU...')"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 */
  private async productImageUpload(req: express.Request, res: express.Response, next: express.NextFunction) {
    const product = await this.productRepo.findOneOrFail({
      id: req.params.productId,
    }, {
      relations: ['brand'],
    })

    const regex = /data:([a-zA-Z]*\/[a-zA-Z]*);base64,([^\"]*)/

    if (!req.body.content) {
      return next(new Error('no content sent'))
    }

    const matches = req.body.content.match(regex)
    if (matches.length !== 3) {
      return next(new Error('invalid base64 string'))
    }

    const mime = matches[1]
    const content = Buffer.from(matches[2], 'base64')

    const image = this.repo.create({
      type: mime,
      name: req.body.name,
      product,
    })
    await this.repo.save(image)

    const exten = extension(mime)
    await this.s3.putObject(config.imagesS3.bucket, `${image.id}.${exten}`, content, {
      'Content-Type': image.type,
    })

    const log = this.logRepo.create({
      action: Action.create,
      refType: RefType.image,
      refId: image.id,
      user: req.context?.user,
      to: image,
    } as Log)
    await this.logRepo.save(log)

    return res.json({
      image,
    })
  }

}
