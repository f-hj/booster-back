import slugify from 'slugify'
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Brand from './Brand'
import Image from './Image'
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
 *           $ref: '#/components/schemas/Brand'
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         currency:
 *           type: string
 *         price:
 *           type: number
 *         models:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductModel'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 */
@Entity()
export default class Product {

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Index()
  @Column({
    default: '',
  })
  public slug: string

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

  @OneToMany((type) => Image, (i) => i.product)
  public images: Image[]

  @BeforeInsert()
  @BeforeUpdate()
  private before() {
    this.slug = slugify(this.name).toLowerCase()
  }

}
