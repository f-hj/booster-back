import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Brand from './Brand'
import ProductModel from './ProductModel'
import User from './User'

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       required:
 *         - name
 *         - description
 *         - currency
 *         - price
 *       properties:
 *         id:
 *           type: string
 *         brand:
 *           type: object
 *           $ref: '#/components/schemas/Brand'
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         currency:
 *           type: string
 *         price:
 *           type: number
 */
@Entity()
export default class Product {

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @ManyToOne((type) => Brand, (brand) => brand.id)
  public brand: Brand

  @Column()
  public name: string

  @Column()
  public description: string

  @Column()
  public currency: string

  @Column()
  public price: number

  @OneToMany((type) => ProductModel, (pm) => pm.product)
  public models: ProductModel[]

}
