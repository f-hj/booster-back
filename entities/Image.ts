import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Product from './Product'
import ProductModel from './ProductModel'

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           description: Mime type
 *         name:
 *           type: string
 *           description: Display name
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         model:
 *           $ref: '#/components/schemas/ProductModel'
 */
@Entity()
export default class Image {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public type: string

  @Column()
  public name: string

  @ManyToOne((type) => Product, (p) => p.images)
  public product?: Product

  @ManyToOne((type) => ProductModel, (p) => p.images)
  public model?: ProductModel
}
