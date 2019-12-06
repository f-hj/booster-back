import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import User from './User'

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessToken:
 *       properties:
 *         accessToken:
 *           type: string
 *         createdAt:
 *           type: string
 *         user:
 *           type: object
 *           $ref: '#/components/schemas/User'
 */
@Entity()
export default class AccessToken {

  @PrimaryColumn()
  public accessToken?: string

  @ManyToOne((type) => User, (user) => user.id)
  public user: User

  @CreateDateColumn()
  public createdAt: string

  public generateToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    while (token.length < 256) {
      token += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    this.accessToken = token
  }

}
