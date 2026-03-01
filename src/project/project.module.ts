import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectImage } from './entities/project-image.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Project, ProjectImage])],
	controllers: [ProjectController],
	providers: [ProjectService],
})
export class ProjectModule { }
