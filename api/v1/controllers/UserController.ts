import bcrypt = require('bcrypt')
import { validate, validateOrReject } from 'class-validator'
import express = require('express')
import { sign as JWTSign } from 'jsonwebtoken'
import passport = require('passport')
import { Connection, Repository } from 'typeorm'
import config from '../../../config'
import AccessToken from '../../../entities/AccessToken'
import User from '../../../entities/User'

export default class UserController {

  private c: Connection
  private repo: Repository<User>
  private acRepo: Repository<AccessToken>

  constructor(c: Connection) {
    this.c = c
    this.repo = c.getRepository(User)
    this.acRepo = c.getRepository(AccessToken)
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    router.get('/:userId', this.getUser.bind(this))
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
 *                 type: object
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
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 */
  private async createUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = this.repo.create(req.body.user as User)
    try {
      await validateOrReject(user)
    } catch (e) {
      return next(e)
    }

    await user.generatePassword()

    try {
      await this.repo.save(user)
    } catch (e) {
      return next(e)
    }

    res.json({
      success: true,
      user: user.JSON(),
    })
  }

/**
 * @swagger
 * /v1/users/{userId}:
 *   get:
 *     summary: Get an user
 *     operationId: getUser
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
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 */
  private async getUser(req: express.Request, res: express.Response) {
    const user = await this.repo.findOneOrFail({
      id: req.params.userId,
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
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ErrorResponse'
 */
  private async loginUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await this.repo.findOne({
      email: req.body.email,
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
