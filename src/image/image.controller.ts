import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ImageService } from './image.service';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.imageService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.imageService.upload(file, req);
  }

  @Post('upload/product/:productId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadToProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.imageService.uploadToProduct(productId, file, req);
  }

  @Post('upload/project/:projectId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadToProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.imageService.uploadToProject(projectId, file, req);
  }

  @Post('product/:productId/:imageId')
  addToProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.imageService.addToProduct(productId, imageId);
  }

  @Post('project/:projectId/:imageId')
  addToProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.imageService.addToProject(projectId, imageId);
  }

  @Delete(':id')
  removeById(@Param('id', ParseUUIDPipe) id: string) {
    return this.imageService.removeById(id);
  }

  @Delete('product/:productId')
  removeByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.imageService.removeByProduct(productId);
  }

  @Delete('project/:projectId')
  removeByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.imageService.removeByProject(projectId);
  }
}

