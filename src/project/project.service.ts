import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';

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

  private resolveBaseUrl(req?: Request) {
    const configuredBaseUrl =
      process.env.IMAGE_BASE_URL ||
      process.env.APP_BASE_URL ||
      process.env.PUBLIC_BASE_URL;

    if (configuredBaseUrl) {
      return configuredBaseUrl.replace(/\/+$/, '');
    }

    if (!req) {
      return '';
    }

    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto || req.protocol;

    const forwardedHost = req.headers['x-forwarded-host'];
    const host = Array.isArray(forwardedHost)
      ? forwardedHost[0]
      : forwardedHost || req.get('host');

    return host ? `${proto}://${host}` : '';
  }

  private buildImageUrl(path?: string, req?: Request) {
    if (!path) {
      return path;
    }

    const baseUrl = this.resolveBaseUrl(req);

    if (!baseUrl) {
      return path;
    }

    return `${baseUrl.replace(/\/+$/, '')}${path}`;
  }

  private withImageUrl<T extends { images?: Array<{ url?: string }> }>(
    item: T,
    req?: Request,
  ): T {
    return {
      ...item,
      images: (item.images ?? []).map((image) => ({
        ...image,
        imgUrl: this.buildImageUrl(image.url, req),
      })),
    };
  }

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

  async findAll(req?: Request) {
    const items = await this.projectRepo.find({
      relations: ['images', 'projectCategory'],
    });
    return items.map((item) => this.withImageUrl(item, req));
  }

  async findByProjectCategoryId(projectCategoryId: string, req?: Request) {
    const items = await this.projectRepo.find({
      where: {
        projectCategory: { id: projectCategoryId },
      },
      relations: ['images', 'projectCategory'],
      order: { name: 'ASC' },
    });
    return items.map((item) => this.withImageUrl(item, req));
  }

  async findOne(id: string, req?: Request) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['images', 'projectCategory'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.withImageUrl(project, req);
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

    const saved = await this.projectRepo.save(project);
    return this.withImageUrl(saved);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectRepo.remove(project);
    return { deleted: true };
  }
}

