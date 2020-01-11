import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Product from './Product'
import ProductModel from './ProductModel'

enum ImagePriority {
  None = 'none',
  Primary = 'primary',
  Secondary = 'secondary',
}

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
 *         priority:
 *           type: string
 *           description: Type of the image for the product
 *           enum: [none, primary, secondary]
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

  @Column({
    default: ImagePriority.None,
  })
  public priority: ImagePriority
}
