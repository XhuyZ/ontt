import {
  IsArray,
  IsNotEmpty,
  IsString,
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

  @ApiProperty({ type: [CreateProjectImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectImageDto)
  images: CreateProjectImageDto[];
}

