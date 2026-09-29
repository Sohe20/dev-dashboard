import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  findAll(userId?: number): Promise<Project[]> {
    if (userId) {
      return this.projectsRepository.find({
        where: { createdBy: { id: userId } },
        relations: { createdBy: true },
      });
    }
    return this.projectsRepository.find({ relations: { createdBy: true } });
  }

  findOne(id: number): Promise<Project | null> {
    return this.projectsRepository.findOneBy({ id });
  }

  create(data: CreateProjectDto, userId: number): Promise<Project> {
    const project = this.projectsRepository.create({
      ...data,
      createdBy: { id: userId } as any,
    });
    return this.projectsRepository.save(project);
  }

  async getTotalRevenue(): Promise<{ total: number }> {
    const projects = await this.projectsRepository.find();
    const total = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    return { total };
  }

  async update(id: number, data: UpdateProjectDto): Promise<Project | null> {
    await this.projectsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.projectsRepository.delete(id);
    return { deleted: true };
  }
}
