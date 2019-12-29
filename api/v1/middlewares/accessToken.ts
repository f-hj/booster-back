import express = require('express')
import { Connection, Repository } from 'typeorm'
import AccessToken from '../../../entities/AccessToken'
import ErrorResponse from '../entities/ErrorResponse'

const checkAccessToken = (c: Connection) => {
  const atRepo = c.getRepository(AccessToken)
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const a = req.get('Authorization')
    if (!a) {
      return res.status(400).json({
        errors: [
          {
            type: 'accessToken',
            property: 'header',
            info: 'No header present in request',
          },
        ],
      } as ErrorResponse)
    }

    const t = a.replace('Bearer ', '')
    const at = await atRepo.findOneOrFail({
      accessToken: t,
    }, {
      relations: ['user', 'user.brands'],
    })

    req.context = {
      user: at.user,
    }

    next()
  }
}

const accessToBrand = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.params.brandId) {
    return next(new Error("Access to a brand without a 'brandId' param is not possible"))
  }

  if (!req.context?.user) {
    return next(new Error('Access to a brand without checking the access token first is not possible'))
  }

  if (req.context.user.isAdmin) {
    return next()
  }

  let accessible = false
  for (const brand of req.context.user.brands) {
    if (brand.id === req.params.id) {
      accessible = true
      break
    }
  }

  if (!accessible) {
    return res.status(402).json({
      errors: [
        {
          type: 'acl',
          info: "You don't have access to this brand",
        },
      ],
    })
  }

  return next()
}

const onlyAdmin = () => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.context.user.isAdmin) {
      res.status(401).json({
        errors: [
          {
            type: 'idiotUser',
          },
        ],
      } as ErrorResponse)
    }

    next()
  }
}

export default {
  checkAccessToken,
  onlyAdmin,
  accessToBrand,
}
