import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Brand from './Brand'

@Entity()
export default class OnboardingUser {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column()
  public email: string

  @ManyToOne((type) => Brand, (brand) => brand.id)
  public brand: Brand
}
