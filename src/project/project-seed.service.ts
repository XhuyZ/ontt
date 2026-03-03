import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Project } from './entities/project.entity';
import { ProjectCategory } from './entities/project-category.entity';

const PROJECT_CATEGORIES: Array<{ id: string; name: string }> = [
  { id: '66f78ef9-14ec-429a-9f17-eb2d7f05e25f', name: 'Trần' },
  { id: '7907a2d0-c5a2-4d2a-ac2d-2680365f50e2', name: 'Phòng Thờ' },
  { id: '01338b05-735e-4fc5-b52d-46d7eb6fd26e', name: 'Phòng khách' },
  { id: '8cfbba31-c74b-4224-b0f2-3b5f8176ce76', name: 'Lam sóng PVC vách TV' },
];

const TRAN_CATEGORY_ID = '66f78ef9-14ec-429a-9f17-eb2d7f05e25f';
const PHONG_THO_CATEGORY_ID = '7907a2d0-c5a2-4d2a-ac2d-2680365f50e2';
const PHONG_KHACH_CATEGORY_ID = '01338b05-735e-4fc5-b52d-46d7eb6fd26e';
const LAM_SONG_VACH_TV_CATEGORY_ID = '8cfbba31-c74b-4224-b0f2-3b5f8176ce76';

const TRAN_PROJECTS = Array.from(
  { length: 12 },
  (_, index) => `Thi công trần ${index + 1}`,
);
const PHONG_THO_PROJECTS = Array.from(
  { length: 12 },
  (_, index) => `Thi công phòng thờ ${index + 1}`,
);
const PHONG_KHACH_PROJECTS = Array.from(
  { length: 6 },
  (_, index) => `Thi công phòng khách ${index + 1}`,
);
const LAM_SONG_VACH_TV_PROJECTS = Array.from(
  { length: 12 },
  (_, index) => `Thi công Lam sóng PVC vách TV ${index + 1}`,
);

@Injectable()
export class ProjectSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProjectSeedService.name);

  constructor(
    @InjectRepository(ProjectCategory)
    private readonly projectCategoryRepo: Repository<ProjectCategory>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async onApplicationBootstrap() {
    await this.projectCategoryRepo.save(PROJECT_CATEGORIES);
    this.logger.log('Project category seed synced with fixed UUIDs');

    await this.seedProjectsForCategory(TRAN_CATEGORY_ID, 'Trần', TRAN_PROJECTS);
    await this.seedProjectsForCategory(
      PHONG_THO_CATEGORY_ID,
      'Phòng Thờ',
      PHONG_THO_PROJECTS,
    );
    await this.seedProjectsForCategory(
      PHONG_KHACH_CATEGORY_ID,
      'Phòng khách',
      PHONG_KHACH_PROJECTS,
    );
    await this.seedProjectsForCategory(
      LAM_SONG_VACH_TV_CATEGORY_ID,
      'Lam sóng PVC vách TV',
      LAM_SONG_VACH_TV_PROJECTS,
    );
  }

  private async seedProjectsForCategory(
    categoryId: string,
    categoryLabel: string,
    projectNames: string[],
  ) {
    const category = await this.projectCategoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      this.logger.warn(
        `${categoryLabel} project category not found, skip project seed`,
      );
      return;
    }

    const existingProjects = await this.projectRepo.find({
      where: {
        projectCategory: { id: categoryId },
        name: In(projectNames),
      },
      relations: ['projectCategory'],
    });

    const existingNames = new Set(existingProjects.map((item) => item.name));
    const missingNames = projectNames.filter((name) => !existingNames.has(name));

    if (missingNames.length === 0) {
      this.logger.log(`${categoryLabel} project seed already up to date`);
      return;
    }

    const rows = missingNames.map((name) =>
      this.projectRepo.create({
        name,
        projectCategory: category,
      }),
    );
    await this.projectRepo.save(rows);
    this.logger.log(`Seeded ${categoryLabel} projects: ${missingNames.length}`);
  }
}

