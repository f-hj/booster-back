import { ValidationError } from 'class-validator'
import cors = require('cors')
import express = require('express')
import os = require('os')
import passeport = require('passport')
import { Connection } from 'typeorm'
import BrandController from './controllers/BrandController'
import ImagesController from './controllers/ImageController'
import ProductController from './controllers/ProductController'
import StatusController from './controllers/StatusController'
import UserController from './controllers/UserController'

const router = express.Router()

/**
 * @swagger
 * /v1/*:
 *   get:
 *     responses:
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const createAPIv1 = async (c: Connection) => {
  router.use(cors({
    origin: [ /[[:alpha:]]*:\/\/localhost:?[[:digit:]]{0,5}/, /booster\.fruitice\.fr$/ ],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  router.use(passeport.initialize())
  router.use((req, res, next) => {
    res.set('X-Booster-Instance', os.hostname())
    res.set('X-Booster-Version', process.env.BOOSTER_VERSION || 'na')
    next()
  })

  router.use('/status', new StatusController(c).router())
  router.use('/brands', new BrandController(c).router())
  router.use('/users', new UserController(c).router())
  router.use('/products', new ProductController(c).router())
  router.use('/images', new ImagesController(c).router())

  router.use((err: express.Errback, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (Array.isArray(err)) {

      if (err[0] instanceof ValidationError) {
        return res.status(401).json({
          errors: err.map((e) => {
            return {
              type: 'validation',
              property: e.property,
              info: `The field ${e.property} is invalid`,
            }
          }),
        })
      }

    }

    console.log('Errors:', err)
    return res.status(500).json({
      errors: [{
        type: 'internal',
        property: err.name,
        info: 'This is an internal error, please try again later',
      }],
    })
  })

  return router
}

export default createAPIv1
