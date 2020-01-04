import { MinLength } from 'class-validator'
import slugify from 'slugify'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import User from './User'

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 */
@Entity()
export default class Brand {

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Index()
  @Column()
  public slug: string

  @Column()
  @MinLength(2, {
    message: 'Name is too short',
  })
  public name: string

  @ManyToMany((type) => User, (user) => user.brands)
  @JoinTable()
  public users: User[]

  @Column({
    default: false,
  })
  public verified: boolean

  public JSON() {
    return {
      id: this.id,
      name: this.name,
      users: this.users ? this.users.map((user) => user.JSON()) : [],
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  private before() {
    this.slug = slugify(this.name).toLowerCase()
  }

}
