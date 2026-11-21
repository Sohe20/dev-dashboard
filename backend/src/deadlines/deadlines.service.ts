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
export const MAX_DEADLINES_PER_PROJECT = 3;


@Injectable()
export class DeadlinesService {


  constructor(
    @InjectRepository(Deadline)
    private readonly deadlineRepository: Repository<Deadline>,
  ) { }

  findByProject(projectId: number): Promise<Deadline[]> {
    return this.deadlineRepository.find({
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

    const project = await this.deadlineRepository.manager.findOneBy(Project, {
      id: data.projectId,
    });
    if (!project) throw new NotFoundException('Project not found');

    const count = await this.deadlineRepository.count({
      where: { project: { id: data.projectId } },
    });
    if (count >= MAX_DEADLINES_PER_PROJECT) {
      throw new BadRequestException('A project can have at most 3 deadlines');
    }

    return this.deadlineRepository.save(
      this.deadlineRepository.create({ title, dueDate, project: { id: data.projectId } }),
    );
  }

  async update(id: number, data: UpdateDeadlineDto): Promise<Deadline> {
    const deadline = await this.deadlineRepository.findOne({ where: { id } });
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

    return this.deadlineRepository.save(deadline);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.deadlineRepository.delete(id);
    return { deleted: true };
  }
}