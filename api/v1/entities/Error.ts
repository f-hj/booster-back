/**
 * @swagger
 * components:
 *   schemas:
 *     ApiError:
 *       properties:
 *         type:
 *           type: string
 *         property:
 *           type: string
 *         info:
 *           type: string
 */

export default class ApiError {
  public type: string
  public property?: string
  public info?: string
}
