import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateProjectImageDto {
  @ApiProperty({ example: 'https://example.com/project-image.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Thi công trần nhựa phòng khách' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '66f78ef9-14ec-429a-9f17-eb2d7f05e25f' })
  @IsUUID()
  projectCategoryId: string;

  @ApiProperty({ type: [CreateProjectImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectImageDto)
  images: CreateProjectImageDto[];
}

