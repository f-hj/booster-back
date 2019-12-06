import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import Brand from './Brand'
import User from './User'

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

}
