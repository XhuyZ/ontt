import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';

const DEFAULT_CATEGORIES: Array<{ id: string; name: string }> = [
  {
    id: '4aa9c891-0057-4c57-90ee-dde4bb95814f',
    name: 'Lam sóng và lam sóng ngoài trời',
  },
  {
    id: '9ea33d43-a9af-48f0-a9b9-f46f8b7cd2c3',
    name: 'Nhựa Nano',
  },
  {
    id: '0ae4ef5a-3152-4568-88dc-c3aeaf7f607a',
    name: 'Tấm PVC',
  },
  {
    id: '76417d0c-cc74-4f9d-85e2-b7113aeb0d92',
    name: 'Than Tre',
  },
];

const THAN_TRE_CATEGORY_ID = '76417d0c-cc74-4f9d-85e2-b7113aeb0d92';
const LAM_SONG_CATEGORY_ID = '4aa9c891-0057-4c57-90ee-dde4bb95814f';
const NHUA_NANO_CATEGORY_ID = '9ea33d43-a9af-48f0-a9b9-f46f8b7cd2c3';
const TAM_PVC_CATEGORY_ID = '0ae4ef5a-3152-4568-88dc-c3aeaf7f607a';

const THAN_TRE_PRODUCTS = [
  'Tấm ốp than tre vân gỗ DB-07-M',
  'Tấm ốp than tre vân gỗ DB-10-M',
  'Tấm ốp than tre vân gỗ DB-11-M',
  'Tấm ốp than tre vân gỗ DB-20-M',
  'Tấm ốp than tre vân gỗ DB-21-M',
  'Tấm ốp than tre vân gỗ DB-66-M',
  'Tấm ốp than tre DB-84-M',
  'Tấm ốp than tre vân gỗ DB-90-M',
  'Tấm ốp than tre vân gỗ DB-111-M',
  'Tấm ốp than tre Màu vân gỗ DB-122-M',
  'Tấm ốp than tre vân gỗ',
  'Tấm ốp than tre vân vải DB-30-B',
  'Tấm ốp than tre vân vải DB-32-B',
  'Tấm ốp than tre vân vải , DB-125-B',
  'Tấm ốp than tre',
  'Tấm ốp than tre màu trắng vân gỗ DB-91-C',
  'Tấm ốp than tre dòng đơn sắc DB-92-C',
  'Tấm ốp than tre,màu đơn sắc DB-94-C',
  'Tấm ốp đan tre đơn sắc DB-95-C',
];

const LAM_SONG_PRODUCTS = [
  'Tấm ốp lam sóng SC01',
  'Tấm ốp lam sóng SN01',
  'Tấm ốp lam sóng SC06',
  'Tấm ốp lam sóng SC05',
  'Tấm ốp lam sóng SN09',
  'Tấm ốp lam sóng ST09',
  'Tấm ốp lam sóng ST07',
  'Tấm ốp lam sóng SN05',
  'Tấm ốp lam sóng SN04',
  'Tấm ốp lam sóng SC12',
  'Tấm ốp lam sóng SN08',
  'Tấm ốp lam sóng ST03',
  'Tấm ốp lam sóng SN06',
  'Tấm ốp lam sóng ST01',
  'Tấm ốp lam sóng SC09',
  'Tấm ốp lam sóng ST06',
  'Tấm ốp lam sóng SN07',
  'Tấm ốp lam sóng SN12',
  'Tấm ốp lam sóng SC03',
  'Tấm ốp lam sóng SN03',
  'Tấm ốp lam sóng ST12',
  'Tấm ốp lam sóng ST04',
  'Tấm ốp lam sóng SC07',
  'Tấm ốp lam sóng SC08',
  'Tấm ốp lam sóng ST05',
  'Tấm ốp lam sóng ST08',
  'Tấm ốp lam sóng SC04',
  'Lam sóng ngoài trời mẫu 1',
  'Lam sóng ngoài trời mẫu 2',
  'Lam sóng ngoài trời mẫu 3',
  'Lam sóng ngoài trời mẫu 4',
  'Lam sóng ngoài trời mẫu 5',
];

const NHUA_NANO_PRODUCTS = Array.from(
  { length: 22 },
  (_, index) => `Tấm ốp nhựa nano mẫu ${index + 1}`,
);

const TAM_PVC_PRODUCTS = Array.from(
  { length: 27 },
  (_, index) => `Tấm ốp PVC mẫu ${index + 1}`,
);

@Injectable()
export class CategorySeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async onApplicationBootstrap() {
    await this.categoryRepo.save(DEFAULT_CATEGORIES);
    this.logger.log('Category seed synced with fixed UUIDs');

    await this.seedProductsForCategory(
      THAN_TRE_CATEGORY_ID,
      'Than Tre',
      THAN_TRE_PRODUCTS,
    );

    await this.seedProductsForCategory(
      LAM_SONG_CATEGORY_ID,
      'Lam sóng và lam sóng ngoài trời',
      LAM_SONG_PRODUCTS,
    );

    await this.seedProductsForCategory(
      NHUA_NANO_CATEGORY_ID,
      'Nhựa Nano',
      NHUA_NANO_PRODUCTS,
    );

    await this.seedProductsForCategory(
      TAM_PVC_CATEGORY_ID,
      'Tấm PVC',
      TAM_PVC_PRODUCTS,
    );
  }

  private async seedProductsForCategory(
    categoryId: string,
    categoryLabel: string,
    productNames: string[],
  ) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      this.logger.warn(`${categoryLabel} category not found, skip product seed`);
      return;
    }

    const existingProducts = await this.productRepo.find({
      where: {
        category: { id: categoryId },
        name: In(productNames),
      },
      relations: ['category'],
    });

    const existingNames = new Set(existingProducts.map((item) => item.name));
    const missingNames = productNames.filter((name) => !existingNames.has(name));

    if (missingNames.length === 0) {
      this.logger.log(`${categoryLabel} product seed already up to date`);
      return;
    }

    const rows = missingNames.map((name) =>
      this.productRepo.create({
        name,
        category,
      }),
    );

    await this.productRepo.save(rows);
    this.logger.log(`Seeded ${categoryLabel} products: ${missingNames.length}`);
  }
}

