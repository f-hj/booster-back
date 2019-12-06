/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       properties:
 *         type:
 *           type: string
 *         property:
 *           type: string
 *         info:
 *           type: string
 */

export default class Error {
  public type: string
  public property?: string
  public info?: string
}
