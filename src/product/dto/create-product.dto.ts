import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Tấm ốp nhựa PVC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '4aa9c891-0057-4c57-90ee-dde4bb95814f' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: [CreateProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images: CreateProductImageDto[];
}

