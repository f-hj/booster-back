import { validateOrReject } from 'class-validator'
import express = require('express')
import { Connection, Repository } from 'typeorm'
import Brand from '../../../entities/Brand'
import Log, { Action, RefType } from '../../../entities/Log'
import OnboardingUser from '../../../entities/OnboardingUser'
import User from '../../../entities/User'
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
  private userRepo: Repository<User>
  private onbUserRepo: Repository<OnboardingUser>
  private logRepo: Repository<Log>

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(Brand)
    this.userRepo = c.getRepository(User)
    this.onbUserRepo = c.getRepository(OnboardingUser)
    this.logRepo = c.getRepository(Log)
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    const chAT = atMw.checkAccessToken(this.c)

    router.get('/brands', this.listBrands.bind(this))
    router.post('/brand', chAT, atMw.onlyAdmin(), this.createBrand.bind(this))
    router.get('/brand/:brandId', this.getBrand.bind(this))
    router.get('/brandLogs/:brandId', chAT, atMw.accessToBrand, this.getBrandLogs.bind(this))
    router.patch('/brand/:brandId', chAT, atMw.accessToBrand, this.updateBrand.bind(this))
    router.post('/brand/:brandId/inviteUser', chAT, atMw.accessToBrand, this.inviteUser.bind(this))
    router.delete('/brand/:brandId', chAT, atMw.accessToBrand, this.deleteBrand.bind(this))
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
    const brands = await this.repo.find({
      relations: ['users'],
    })
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

    const log = this.logRepo.create({
      action: Action.create,
      refType: RefType.brand,
      refId: brand.id,
      user: req.context?.user,
      to: brand,
    } as Log)
    await this.logRepo.save(log)
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
 *                 brand:
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 */
  private async getBrand(req: express.Request, res: express.Response) {
    const brand = await this.repo.findOne({
      id: req.params.brandId,
    })

    res.json({
      brand,
    })
  }

/**
 * @swagger
 * /v1/brands/brandLogs/{brandId}:
 *   get:
 *     summary: Get a brand with logs
 *     operationId: getBrandLogs
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
 *                 brand:
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 */
private async getBrandLogs(req: express.Request, res: express.Response) {
  const brand = await this.repo.findOne({
    id: req.params.brandId,
  })

  const logs = await this.logRepo.find({
    where: {
      refType: RefType.brand,
      refId: brand.id,
    },
    relations: ['user'],
  })

  res.json({
    brand,
    logs,
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
    const brand = this.repo.create(req.body.brand as Brand)
    brand.id = req.params.brandId

    await this.repo.save(brand)
    res.json({
      success: true,
      brand,
    })

    const log = this.logRepo.create({
      action: Action.update,
      refType: RefType.brand,
      refId: brand.id,
      user: req.context?.user,
      to: brand.JSON(),
    } as Log)
    await this.logRepo.save(log)
  }

/**
 * @swagger
 * /v1/brands/brand/{brandId}/inviteUser:
 *   post:
 *     summary: Invite a user to a brand
 *     operationId: inviteUser
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
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brand:
 *                   type: object
 *                   $ref: '#/components/schemas/Brand'
 *                 message:
 *                   type: string
 *                 info:
 *                   type: string
 *                 onboardingId:
 *                   type: string
 */
  private async inviteUser(req: express.Request, res: express.Response) {
    const user = await this.userRepo.findOne({
      email: req.body.email,
    })

    const brand = await this.repo.findOneOrFail({
      id: req.params.brandId,
    })

    if (!user) {
      const onb = this.onbUserRepo.create({
        email: req.body.email,
        brand,
      } as OnboardingUser)
      await this.onbUserRepo.save(onb)

      // TODO: send mail to user with invite link
      console.log('ONBOARDING USER: ' + onb.id)

      const log = this.logRepo.create({
        action: Action.create,
        refType: RefType.onboardingUser,
        refId: onb.id,
        user: req.context?.user,
        to: onb,
      } as Log)
      await this.logRepo.save(log)

      res.json({
        message: 'onboarding sent',
        info: 'The invitation is sent, your user will fill a form with some infos',
        brand,
        onboardingId: onb.id,
      })

      return
    }

    const log = this.logRepo.create({
      action: Action.update,
      refType: RefType.brand,
      refId: brand.id,
      user: req.context?.user,
      from: brand,
    } as Log)

    // TODO: bha, js...
    if (!brand.users) {
      brand.users = [user]
    } else {
      brand.users.push(user)
    }

    await this.repo.save(brand)
    log.to = brand

    await this.logRepo.save(log)

    res.json({
      message: 'user added',
      info: 'The user have now access to your brand',
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
