import bcrypt = require('bcrypt')
import { IsEmail, MinLength } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       required:
 *         - name
 *         - password
 *         - email
 *       properties:
 *         id:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         isAdmin:
 *           type: boolean
 */
@Entity()
export default class User {

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public password: string

  @Column()
  public salt: string

  @Column()
  @MinLength(2, {
    message: 'Name is too short',
  })
  public name: string

  @Column()
  @IsEmail()
  public email: string

  @Column({
    default: false,
  })
  public isAdmin: boolean

  public async generatePassword() {
    this.salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, this.salt)
  }

  public JSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    }
  }
}
