
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

export default class Login {
  public email: string
  public password: string
}
