import bcrypt = require('bcrypt')
import { IsEmail, MinLength } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, CreateDateColumn, ManyToOne } from 'typeorm'
import AccessToken from './AccessToken'
import Brand from './Brand'

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
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
 *         brands:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Brand'
 *         createdAt:
 *           type: string
 */
@Entity()
export default class User {

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({
    select: false,
  })
  public password: string

  @Column({
    select: false,
  })
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

  @ManyToMany((type) => Brand, (brand) => brand.users)
  public brands: Brand[]

  public async hashPassword() {
    this.salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, this.salt)
  }

  public JSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      brands: this.brands,
    }
  }

  public canAccessBrandId(id: string) {
    let accessible = false
    for (const brand of this.brands) {
      if (brand.id === id) {
        accessible = true
        break
      }
    }

    return accessible
  }
}
