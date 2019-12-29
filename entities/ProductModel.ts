import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Product from './Product'

@Entity()
export default class ProductModel {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public name: string

  @ManyToOne((type) => Product, (p) => p.models)
  public product: Product

}
