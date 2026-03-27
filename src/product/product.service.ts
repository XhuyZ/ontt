import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';

import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) { }

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

  async findAll(req?: Request, query?: GetProductsQueryDto) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    if (query?.ids) {
      const ids = query.ids.split(',').map((id) => id.trim());
      queryBuilder.andWhere('product.id IN (:...ids)', { ids });
    }

    if (query?.random) {
      queryBuilder.orderBy('RANDOM()');
    } else {
      queryBuilder.orderBy('product.name', 'ASC');
    }

    if (query?.limit) {
      queryBuilder.limit(query.limit);
    }

    const items = await queryBuilder.getMany();
    return items.map((item) => this.withImageUrl(item, req));
  }

  async findByCategoryId(
    categoryId: string,
    req?: Request,
    query?: GetProductsQueryDto,
  ) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('category.id = :categoryId', { categoryId });

    if (query?.ids) {
      const ids = query.ids.split(',').map((id) => id.trim());
      queryBuilder.andWhere('product.id IN (:...ids)', { ids });
    }

    if (query?.random) {
      queryBuilder.orderBy('RANDOM()');
    } else {
      queryBuilder.orderBy('product.name', 'ASC');
    }

    if (query?.limit) {
      queryBuilder.limit(query.limit);
    }

    const items = await queryBuilder.getMany();
    return items.map((item) => this.withImageUrl(item, req));
  }

  async findOne(id: string, req?: Request) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.withImageUrl(product, req);
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

