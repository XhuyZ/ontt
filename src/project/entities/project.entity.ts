import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProjectImage } from './project-image.entity';

@Entity()
export class Project {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(() => ProjectImage, (image) => image.project, {
		cascade: true,
	})
	images: ProjectImage[];
}
