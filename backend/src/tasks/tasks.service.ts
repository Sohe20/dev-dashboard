
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
      relations: { project: true },
    });
  }
  return this.tasksRepository.find({ relations: { project: true } });
}

  findOne(id: number): Promise<Task | null> {
    return this.tasksRepository.findOneBy({ id });
  }

create(data: CreateTaskDto): Promise<Task> {
  const task = this.tasksRepository.create({
    title: data.title,
    description: data.description,
    status: data.status,
    project: data.projectId ? { id: data.projectId } : undefined,
  });
  return this.tasksRepository.save(task);
}

 async update(id: number, data: UpdateTaskDto): Promise<Task | null> {
  const { projectId, ...rest } = data as any;
  await this.tasksRepository.update(id, rest);
  if (projectId) {
    await this.tasksRepository
      .createQueryBuilder()
      .relation(Task, 'project')
      .of(id)
      .set(projectId);
  }
  return this.findOne(id);
}

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.tasksRepository.delete(id);
    return { deleted: true };
  }
}