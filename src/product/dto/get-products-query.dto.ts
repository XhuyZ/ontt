import { IsOptional, IsInt, IsBoolean, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto {
    @ApiPropertyOptional({ description: 'Limit the number of results' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ description: 'Randomize result order' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    random?: boolean;

    @ApiPropertyOptional({ description: 'Filter by specific IDs (comma separated)' })
    @IsOptional()
    @IsString()
    ids?: string;
}
