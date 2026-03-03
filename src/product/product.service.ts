import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  private buildImageUrl(path?: string) {
    if (!path) {
      return path;
    }

    const baseUrl =
      process.env.IMAGE_BASE_URL ||
      process.env.APP_BASE_URL ||
      process.env.PUBLIC_BASE_URL ||
      '';

    if (!baseUrl) {
      return path;
    }

    return `${baseUrl.replace(/\/+$/, '')}${path}`;
  }

  private withImageUrl<T extends { images?: Array<{ url?: string }> }>(item: T): T {
    return {
      ...item,
      images: (item.images ?? []).map((image) => ({
        ...image,
        imgUrl: this.buildImageUrl(image.url),
      })),
    };
  }

  async create(dto: CreateProductDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepo.create({
      name: dto.name,
      category,
      images: dto.images, // cascade true nên auto insert
    });

    return this.productRepo.save(product);
  }

  async findAll() {
    const items = await this.productRepo.find({
      relations: ['category', 'images'],
    });
    return items.map((item) => this.withImageUrl(item));
  }

  async findByCategoryId(categoryId: string) {
    const items = await this.productRepo.find({
      where: {
        category: { id: categoryId },
      },
      relations: ['category', 'images'],
      order: { name: 'ASC' },
    });
    return items.map((item) => this.withImageUrl(item));
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.withImageUrl(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.name !== undefined) {
      product.name = dto.name;
    }

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      product.category = category;
    }

    if (dto.images !== undefined) {
      // Ghi đè toàn bộ danh sách images, cascade: true sẽ tự động insert/update
      product.images = dto.images as any;
    }

    const saved = await this.productRepo.save(product);
    return this.withImageUrl(saved);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { deleted: true };
  }
}

