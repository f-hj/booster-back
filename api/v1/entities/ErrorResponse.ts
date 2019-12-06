import Error from './Error'

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Error'
 */

export default class ErrorResponse {
  public errors: Error[]
}
