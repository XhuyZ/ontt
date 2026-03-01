import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image } from '../product/entities/product-image.entity';
import { Product } from '../product/entities/product.entity';
import { Project } from '../project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Product, Project]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}

