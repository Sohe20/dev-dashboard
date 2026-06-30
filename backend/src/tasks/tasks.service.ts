import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  findAll(projectId?: number): Promise<Task[]> {
    if (projectId) {
      return this.tasksRepository.find({
        where: { project: { id: projectId } },
        relations: { project: true, assignee: true, assignedBy: true },
      });
    }
    return this.tasksRepository.find({
      relations: { project: true, assignee: true, assignedBy: true },
    });
  }

  findOne(id: number): Promise<Task | null> {
    return this.tasksRepository.findOne({
      where: { id },
      relations: { project: true, assignee: true, assignedBy: true },
    });
  }

  findByAssignee(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignee: { id: userId } },
      relations: { project: true, assignee: true, assignedBy: true },
    });
  }

  findByUser(userId: number): Promise<Task[]> {
  return this.tasksRepository.find({
    where: { assignee: { id: userId } },
    relations: { project: true, assignee: true, assignedBy: true },
  });
}


  create(data: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      title: data.title,
      description: data.description,
      status: data.status,
      project: data.projectId ? { id: data.projectId } : undefined,
      assignee: data.assigneeId ? { id: data.assigneeId } : undefined,
      assignedBy: data.assignedById ? { id: data.assignedById } : undefined,
    });
    return this.tasksRepository.save(task);
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task | null> {
    const { projectId, assigneeId, ...rest } = data as any;
    await this.tasksRepository.update(id, rest);
    if (projectId) {
      await this.tasksRepository
        .createQueryBuilder()
        .relation(Task, 'project')
        .of(id)
        .set(projectId);
    }
    if (assigneeId !== undefined) {
      await this.tasksRepository
        .createQueryBuilder()
        .relation(Task, 'assignee')
        .of(id)
        .set(assigneeId || null);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.tasksRepository.delete(id);
    return { deleted: true };
  }
}
