import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image } from '../product/entities/product-image.entity';
import { Product } from '../product/entities/product.entity';
import { Project } from '../project/entities/project.entity';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Product, Project]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase();
          const safeExt = ext && ext.length <= 10 ? ext : '';
          const name = `${Date.now()}-${randomBytes(8).toString('hex')}${safeExt}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}

