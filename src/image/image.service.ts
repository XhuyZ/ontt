import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Image } from '../product/entities/product-image.entity';
import { Product } from '../product/entities/product.entity';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepo: Repository<Image>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [items, total] = await this.imageRepo.findAndCount({
      relations: ['product', 'project'],
      order: { id: 'DESC' },
      skip,
      take,
    });

    return {
      data: items,
      total,
      page: Math.max(page, 1),
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const url = `/uploads/${file.filename}`;

    // Tạo trước 1 bản ghi image độc lập, chưa gắn product/project
    const image = this.imageRepo.create({ url });
    const saved = await this.imageRepo.save(image);

    // Trả ra để client lấy id & url dùng sau
    return { id: saved.id, url: saved.url };
  }

  async uploadToProduct(productId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const url = `/uploads/${file.filename}`;
    const image = this.imageRepo.create({ url, product, project: null });
    const saved = await this.imageRepo.save(image);

    return { id: saved.id, url: saved.url, productId: product.id };
  }

  async uploadToProject(projectId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const url = `/uploads/${file.filename}`;
    const image = this.imageRepo.create({ url, project, product: null });
    const saved = await this.imageRepo.save(image);

    return { id: saved.id, url: saved.url, projectId: project.id };
  }

  async addToProduct(productId: string, imageId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    image.product = product;
    image.project = null;

    return this.imageRepo.save(image);
  }

  async addToProject(projectId: string, imageId: string) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    image.project = project;
    image.product = null;

    return this.imageRepo.save(image);
  }

  async removeById(id: string) {
    const image = await this.imageRepo.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.imageRepo.remove(image);
    return { deleted: true };
  }

  async removeByProduct(productId: string) {
    const result = await this.imageRepo
      .createQueryBuilder()
      .delete()
      .where('productId = :productId', { productId })
      .execute();

    return { deleted: result.affected ?? 0 };
  }

  async removeByProject(projectId: string) {
    const result = await this.imageRepo
      .createQueryBuilder()
      .delete()
      .where('projectId = :projectId', { projectId })
      .execute();

    return { deleted: result.affected ?? 0 };
  }
}

