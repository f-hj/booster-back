import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import Product from './Product'

@Entity()
export default class {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public name: string

  @ManyToOne((type) => Product, (p) => p.models)
  public product: Product

}
