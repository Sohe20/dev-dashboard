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

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  findOne(id: number): Promise<Task | null> {
    return this.tasksRepository.findOneBy({ id });
  }

  create(data: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(data);
    return this.tasksRepository.save(task);
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task | null> {
    await this.tasksRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.tasksRepository.delete(id);
    return { deleted: true };
  }
}