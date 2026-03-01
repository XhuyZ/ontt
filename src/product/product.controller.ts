import {
	Controller,
	Post,
	Get,
	Param,
	Body,
	ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) { }

	@Post()
	create(@Body() dto: CreateProductDto) {
		return this.productService.create(dto);
	}

	@Get()
	findAll() {
		return this.productService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productService.findOne(id);
	}
}
