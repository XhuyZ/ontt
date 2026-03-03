import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectCategory } from './entities/project-category.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectCategory)
    private readonly projectCategoryRepo: Repository<ProjectCategory>,
  ) {}

  async create(dto: CreateProjectDto) {
    const projectCategory = await this.projectCategoryRepo.findOne({
      where: { id: dto.projectCategoryId },
    });

    if (!projectCategory) {
      throw new NotFoundException('Project category not found');
    }

    const project = this.projectRepo.create({
      name: dto.name,
      projectCategory,
      // cascade: true trên Project.images sẽ tự động insert
      images: dto.images as any,
    });

    return this.projectRepo.save(project);
  }

  findAll() {
    return this.projectRepo.find({
      relations: ['images', 'projectCategory'],
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['images', 'projectCategory'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id);

    if (dto.name !== undefined) {
      project.name = dto.name;
    }

    if (dto.projectCategoryId !== undefined) {
      const projectCategory = await this.projectCategoryRepo.findOne({
        where: { id: dto.projectCategoryId },
      });

      if (!projectCategory) {
        throw new NotFoundException('Project category not found');
      }

      project.projectCategory = projectCategory;
    }

    if (dto.images !== undefined) {
      // Ghi đè toàn bộ danh sách images
      project.images = dto.images as any;
    }

    return this.projectRepo.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectRepo.remove(project);
    return { deleted: true };
  }
}

