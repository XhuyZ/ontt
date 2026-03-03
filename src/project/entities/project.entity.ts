import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Image } from '../../product/entities/product-image.entity';
import { ProjectCategory } from './project-category.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(
    () => ProjectCategory,
    (projectCategory) => projectCategory.projects,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  projectCategory?: ProjectCategory | null;

  @OneToMany(() => Image, (image) => image.project, {
    cascade: true,
  })
  images: Image[];
}
