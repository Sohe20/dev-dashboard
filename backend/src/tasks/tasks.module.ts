import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TeamModule } from 'src/team/team.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), TeamModule, NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule { }