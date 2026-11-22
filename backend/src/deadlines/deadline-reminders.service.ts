import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Task } from '../tasks/entities/task.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { Deadline } from './entities/deadline.entity';

const REMINDER_HOURS = 24;

@Injectable()
export class DeadlineRemindersService {
  private readonly logger = new Logger(DeadlineRemindersService.name);
  private running = false;

  constructor(
    @InjectRepository(Deadline)
    private readonly repo: Repository<Deadline>,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async check() {
    if (this.running) return;
    this.running = true;
    try {
      await this.sendSoon();
      await this.sendOverdue();
    } catch (e) {
      this.logger.error(`Deadline check failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private async sendSoon() {
    const now = new Date();
    const limit = new Date(now.getTime() + REMINDER_HOURS * 3600 * 1000);
    const list = await this.repo.find({
      where: {
        isDone: false,
        reminderSentAt: IsNull(),
        dueDate: Between(now, limit),
      },
      relations: { project: true },
    });

    for (const d of list) {
      await this.notify(d, 'deadline_soon', 'is due soon');
      await this.repo.update(d.id, { reminderSentAt: new Date() });
    }
  }

  private async sendOverdue() {
    const list = await this.repo.find({
      where: {
        isDone: false,
        overdueSentAt: IsNull(),
        dueDate: LessThanOrEqual(new Date()),
      },
      relations: { project: true },
    });

    for (const d of list) {
      await this.notify(d, 'deadline_overdue', 'is overdue');
      await this.repo.update(d.id, { overdueSentAt: new Date() });
    }
  }

  private async recipients(d: Deadline): Promise<number[]> {
    const ids = new Set<number>();

    const leads = await this.repo.manager.find(TeamMember, {
      where: { role: 'Team Lead' },
    });
    leads.forEach((m) => m.userId && ids.add(m.userId));

    const tasks = await this.repo.manager.find(Task, {
      where: { project: { id: d.project.id } },
      relations: { assignee: true },
    });
    tasks.forEach((t) => {
      if (t.assignee && t.status !== 'done') ids.add(t.assignee.id);
    });

    return [...ids];
  }

  private async notify(
    d: Deadline,
    type: 'deadline_soon' | 'deadline_overdue',
    what: string,
  ) {
    const ids = await this.recipients(d);
    const message = `Deadline "${d.title}" of project "${d.project.name}" ${what}`;
    for (const id of ids) {
      await this.notifications.create({
        recipientId: id,
        deadlineId: d.id,
        type,
        message,
      });
    }
    this.logger.log(`${type} for deadline #${d.id} sent to ${ids.length} user(s)`);
  }
}