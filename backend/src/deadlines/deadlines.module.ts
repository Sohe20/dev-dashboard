import { Module } from '@nestjs/common';
import { DeadlinesService } from './deadlines.service';
import { DeadlinesController } from './deadlines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deadline } from './entities/deadline.entity';
import { TeamModule } from 'src/team/team.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { DeadlineRemindersService } from './deadline-reminders.service';

@Module({
  imports:[TypeOrmModule.forFeature([Deadline]) , TeamModule , NotificationsModule],
  controllers: [DeadlinesController , ],
  providers: [DeadlinesService , DeadlineRemindersService],
})
export class DeadlinesModule {}
