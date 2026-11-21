import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';
import { Deadline } from './entities/deadline.entity';

@Injectable()
export class DeadlinesService {

  constructor(
    @InjectRepository(Deadline)
    private readonly repo: Repository<Deadline>,
  ) {}

  findByProject(projectId: number): Promise<Deadline[]> {
    return this.repo.find({
      where: { project: { id: projectId } },
      order: { dueDate: 'ASC' },
    });
  }

  private parseDate(value: string): Date {
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid date');
    return d;
  }

  async create(data: CreateDeadlineDto): Promise<Deadline> {
    const title = data.title?.trim();
    if (!title) throw new BadRequestException('Title is required');
    if (!data.projectId) throw new BadRequestException('Project is required');
    const dueDate = this.parseDate(data.dueDate);

    const project = await this.repo.manager.findOneBy(Project, {
      id: data.projectId,
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.repo.save(
      this.repo.create({ title, dueDate, project: { id: data.projectId } }),
    );
  }

  async update(id: number, data: UpdateDeadlineDto): Promise<Deadline> {
    const deadline = await this.repo.findOne({ where: { id } });
    if (!deadline) throw new NotFoundException('Deadline not found');

    if (data.title !== undefined) {
      const title = data.title.trim();
      if (!title) throw new BadRequestException('Title is required');
      deadline.title = title;
    }
    if (data.dueDate !== undefined) {
      deadline.dueDate = this.parseDate(data.dueDate);
      // با عوض‌شدن تاریخ، یادآوری‌ها باید دوباره فرستاده بشن
      deadline.reminderSentAt = null;
      deadline.overdueSentAt = null;
    }
    if (data.isDone !== undefined) deadline.isDone = data.isDone;

    return this.repo.save(deadline);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.repo.delete(id);
    return { deleted: true };
  }
}