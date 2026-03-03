import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Image } from '../product/entities/product-image.entity';
import { ProjectCategory } from './entities/project-category.entity';
import { ProjectSeedService } from './project-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectCategory, Image])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectSeedService],
})
export class ProjectModule {}
