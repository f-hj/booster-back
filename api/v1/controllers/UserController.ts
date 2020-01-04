import bcrypt = require('bcrypt')
import { validate, validateOrReject } from 'class-validator'
import express = require('express')
import { sign as JWTSign } from 'jsonwebtoken'
import passport = require('passport')
import { Connection, Repository } from 'typeorm'
import config from '../../../config'
import AccessToken from '../../../entities/AccessToken'
import Log, { Action, RefType } from '../../../entities/Log'
import User from '../../../entities/User'
import atMw from '../middlewares/accessToken'

export default class UserController {

  private c: Connection
  private repo: Repository<User>
  private logRepo: Repository<Log>
  private acRepo: Repository<AccessToken>

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(User)
    this.logRepo = c.getRepository(Log)
    this.acRepo = c.getRepository(AccessToken)
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    const chAT = atMw.checkAccessToken(this.c)

    router.get('/user/:userId', chAT, atMw.onlyAdmin(), this.getUser.bind(this))
    router.get('/users', chAT, atMw.onlyAdmin(), this.listUsers.bind(this))
    router.get('/me', chAT, this.getMyself.bind(this))
    router.post('/', this.createUser.bind(this))
    router.post('/login', this.loginUser.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create an user
 *     operationId: createUser
 *     tags:
 *       - Users
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/User'
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
  private async createUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = this.repo.create(req.body.user as User)

    // TODO: check if user exists

    try {
      await validateOrReject(user)
    } catch (e) {
      return next(e)
    }

    await user.hashPassword()

    try {
      await this.repo.save(user)
    } catch (e) {
      return next(e)
    }

    res.json({
      success: true,
      user: user.JSON(),
    })

    const log = this.logRepo.create({
      action: Action.create,
      refType: RefType.user,
      refId: user.id,
      user: req.context?.user,
      to: user.JSON(),
    } as Log)
    await this.logRepo.save(log)
  }

/**
 * @swagger
 * /v1/users/users:
 *   get:
 *     summary: List all users
 *     operationId: listUsers
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
private async listUsers(req: express.Request, res: express.Response) {
  const users = await this.repo.find({
    relations: ['brands'],
  })
  return res.json({
    users,
  })
}

/**
 * @swagger
 * /v1/users/user/{userId}:
 *   get:
 *     summary: Get an user
 *     operationId: getUser
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 */
  private async getUser(req: express.Request, res: express.Response) {
    const user = await this.repo.findOneOrFail({
      id: req.params.userId,
    }, {
      relations: ['brands'],
    })

    const logs = await this.logRepo.find({
      where: {
        refType: RefType.user,
        refId: user.id,
      },
      relations: ['user'],
    })

    res.json({
      user,
      logs,
    })
  }

/**
 * @swagger
 * /v1/users/me:
 *   get:
 *     summary: Get current logged user
 *     operationId: getMyself
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
  private async getMyself(req: express.Request, res: express.Response) {
    const user = await this.repo.findOneOrFail({
      id: req.context.user.id,
    }, {
      relations: ['brands'],
    })
    res.json({
      user,
    })
  }

/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     summary: Login an user
 *     operationId: loginUser
 *     tags:
 *       - Users
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async loginUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await this.repo.findOne({
      where: {
        email: req.body.email,
      },
      select: ['password', 'id', 'salt', 'name', 'email', 'isAdmin'],
      relations: ['brands'],
    })
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            type: 'login',
            property: 'email',
          },
        ],
      })
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
      return res.status(401).json({
        errors: [
          {
            type: 'login',
            property: 'password',
          },
        ],
      })
    }

    const token: AccessToken = this.acRepo.create({
      user,
    } as AccessToken)
    token.generateToken()
    await this.acRepo.save(token)

    res.json({
      success: true,
      user: user.JSON(),
      token: token.accessToken,
    })
  }

}
