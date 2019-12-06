import express = require('express')
import { Connection } from 'typeorm'

/**
 * @swagger
 * tags:
 *   name: Status
 *   description: Status checks
 */

export default class StatusController {

  private c: Connection

  constructor(c: Connection) {
    this.c = c
  }

  public router() {
    const router = express.Router({ mergeParams: true })

    router.get('/', this.getStatus.bind(this))

    return router
  }

/**
 * @swagger
 * /v1/status:
 *   get:
 *     summary: Get current status
 *     operationId: getStatus
 *     tags:
 *       - Status
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
  private getStatus(req: express.Request, res: express.Response) {
    res.json({
      status: true,
    })
  }

}
