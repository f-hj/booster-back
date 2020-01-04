import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Image from './Image'
import Product from './Product'

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductModel:
 *       required:
 *         - name
 *         - description
 *         - currency
 *         - price
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 */
@Entity()
export default class ProductModel {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public name: string

  @ManyToOne((type) => Product, (p) => p.models)
  public product: Product

  @OneToMany((type) => Image, (i) => i.model)
  public images: Image[]

}
