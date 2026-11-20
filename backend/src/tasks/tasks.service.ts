import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private notifications: NotificationsService,
  ) { }
  private async recalcProgress(projectId?: number | null) {
    if (!projectId) return;
    const total = await this.tasksRepository.count({
      where: { project: { id: projectId } },
    });
    const done = await this.tasksRepository.count({
      where: { project: { id: projectId }, status: 'done' },
    });
    const progress = total ? Math.round((done / total) * 100) : 0;
    await this.tasksRepository.manager.update(Project, projectId, { progress });
  }

  findAll(projectId?: number, userId?: number): Promise<Task[]> {
    if (projectId) {
      return this.tasksRepository.find({
        where: {
          project: { id: projectId },
          assignedBy: userId ? { id: userId } : undefined,
        },
        relations: { project: true, assignee: true, assignedBy: true },
      });
    }
    if (userId) {
      return this.tasksRepository.find({
        where: [
          { assignedBy: { id: userId } },
          { assignee: { id: userId } },
        ],
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

  async getActivityData(): Promise<{ labels: string[]; data: number[] }> {
    const tasks = await this.tasksRepository.find();

    const now = new Date();
    const weeks: { label: string; count: number }[] = [];

    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - 6);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const count = tasks.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= weekStart && created <= weekEnd;
      }).length;

      weeks.push({
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        count,
      });
    }

    return {
      labels: weeks.map((w) => w.label),
      data: weeks.map((w) => w.count),
    };
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      title: data.title,
      description: data.description,
      status: data.status,
      project: data.projectId ? { id: data.projectId } : undefined,
      assignee: data.assigneeId ? { id: data.assigneeId } : undefined,
      assignedBy: data.assignedById ? { id: data.assignedById } : undefined,
    });
    const saved = await this.tasksRepository.save(task);
    await this.recalcProgress(data.projectId);
    return saved;
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task | null> {
    const before = await this.findOne(id);
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
    const after = await this.findOne(id);
    await this.recalcProgress(after?.project?.id);
    if (before?.project?.id && before.project.id !== after?.project?.id) {
      await this.recalcProgress(before.project.id);
    }
    return after;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const task = await this.findOne(id);
    await this.tasksRepository.delete(id);
    await this.recalcProgress(task?.project?.id);
    return { deleted: true };
  }

  private async getOrFail(id: number): Promise<Task> {
    const task = await this.findOne(id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private async notifyLead(task: Task, senderId: number, type: string, message: string) {
    if (!task.assignedBy || task.assignedBy.id === senderId) return;
    await this.notifications.create({
      recipientId: task.assignedBy.id,
      senderId,
      taskId: task.id,
      type,
      message,
    });
  }

  private async notifyAssignee(task: Task, senderId: number, type: string, message: string) {
    if (!task.assignee || task.assignee.id === senderId) return;
    await this.notifications.create({
      recipientId: task.assignee.id,
      senderId,
      taskId: task.id,
      type,
      message,
    });
  }

  // عضو: تیک انجام شد
  async complete(id: number, userId: number) {
    const task = await this.getOrFail(id);
    if (task.assignee?.id !== userId) {
      throw new ForbiddenException('This task is not assigned to you');
    }
    if (task.status === 'done' || task.status === 'review') {
      throw new BadRequestException('Task is already completed or waiting for review');
    }
    await this.tasksRepository.update(id, { status: 'review' });
    await this.notifyLead(task, userId, 'completed', `${task.assignee.name} marked "${task.title}" as done`);
    return this.findOne(id);
  }

  // عضو: گزارش مشکل
  async reportIssue(id: number, userId: number, message?: string) {
    const text = message?.trim();
    if (!text) throw new BadRequestException('Please describe the issue');
    const task = await this.getOrFail(id);
    if (task.assignee?.id !== userId) {
      throw new ForbiddenException('This task is not assigned to you');
    }
    if (task.status === 'done') throw new BadRequestException('Task is already done');
    await this.tasksRepository.update(id, { status: 'blocked' });
    await this.notifyLead(task, userId, 'issue', `${task.assignee.name} reported an issue on "${task.title}": ${text}`);
    return this.findOne(id);
  }

  // Team Lead: تأیید
  async approve(id: number, leadId: number) {
    const task = await this.getOrFail(id);
    if (task.status !== 'review') {
      throw new BadRequestException('Task is not waiting for review');
    }
    await this.tasksRepository.update(id, { status: 'done' });
    await this.recalcProgress(task.project?.id);
    await this.notifyAssignee(task, leadId, 'approved', `"${task.title}" was approved`);
    return this.findOne(id);
  }

  // Team Lead: برگشت‌دادن (هم برای review هم برای مشکل گزارش‌شده)
  async sendBack(id: number, leadId: number, message?: string) {
    const task = await this.getOrFail(id);
    if (task.status !== 'review' && task.status !== 'blocked') {
      throw new BadRequestException('Nothing to send back');
    }
    await this.tasksRepository.update(id, { status: 'inprogress' });
    const note = message?.trim();
    await this.notifyAssignee(
      task,
      leadId,
      'rejected',
      note ? `"${task.title}" was sent back: ${note}` : `"${task.title}" was sent back`,
    );
    return this.findOne(id);
  }
}
