import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Project } from '../../project/entities/project.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  product?: Product | null;

  @ManyToOne(() => Project, (project) => project.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  project?: Project | null;
}
