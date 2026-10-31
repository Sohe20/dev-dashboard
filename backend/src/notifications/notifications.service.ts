import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(data: {
    recipientId: number;
    senderId?: number;
    taskId?: number;
    type: string;
    message: string;
  }) {
    return this.repo.save(
      this.repo.create({
        recipient: { id: data.recipientId },
        ...(data.senderId ? { sender: { id: data.senderId } } : {}),
        ...(data.taskId ? { task: { id: data.taskId } } : {}),
        type: data.type,
        message: data.message,
      }),
    );
  }

  findMine(userId: number) {
    return this.repo.find({
      where: { recipient: { id: userId } },
      relations: { task: true, sender: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  unreadCount(userId: number) {
    return this.repo.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

  async markRead(id: number, userId: number) {
    const n = await this.repo.findOne({
      where: { id, recipient: { id: userId } },
    });
    if (!n) throw new NotFoundException();
    n.isRead = true;
    return this.repo.save(n);
  }

  async markAllRead(userId: number) {
    const list = await this.repo.find({
      where: { recipient: { id: userId }, isRead: false },
    });
    list.forEach((n) => (n.isRead = true));
    await this.repo.save(list);
    return { ok: true };
  }
}