import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import User from './User'

export enum Action {
  info = 'info',
  create = 'create',
  update = 'update',
  delete = 'delete',
}
export enum RefType {
  image = 'image',
  user = 'user',
  brand = 'brand',
  product = 'product',
  onboardingUser = 'onboardingUser',
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       properties:
 *         refType:
 *           type: string
 *         refId:
 *           type: string
 *         date:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         action:
 *           type: string
 */

@Entity()
export default class Log {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public refType: RefType

  @Column()
  public refId: string

  @CreateDateColumn()
  public date: string

  @ManyToOne((type) => User, (user) => user.id)
  public user?: User

  @Column()
  public action: Action

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  public from?: any

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  public to?: any
}
