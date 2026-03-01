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

  async addToProduct(productId: number, imageId: number) {
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

  async addToProject(projectId: number, imageId: number) {
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
}

