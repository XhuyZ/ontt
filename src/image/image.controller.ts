import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.upload(file);
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
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imageService.uploadToProduct(productId, file);
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
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imageService.uploadToProject(projectId, file);
  }

  @Post('product/:productId/:imageId')
  addToProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.imageService.addToProduct(productId, imageId);
  }

  @Post('project/:projectId/:imageId')
  addToProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.imageService.addToProject(projectId, imageId);
  }

  @Delete(':id')
  removeById(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.removeById(id);
  }

  @Delete('product/:productId')
  removeByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.imageService.removeByProduct(productId);
  }

  @Delete('project/:projectId')
  removeByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.imageService.removeByProject(projectId);
  }
}

