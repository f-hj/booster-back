import ApiError from './Error'

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ApiError'
 */

export default class ErrorResponse {
  public errors: ApiError[]
}
