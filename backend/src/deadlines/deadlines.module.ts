import { Module } from '@nestjs/common';
import { DeadlinesService } from './deadlines.service';
import { DeadlinesController } from './deadlines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deadline } from './entities/deadline.entity';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports:[TypeOrmModule.forFeature([Deadline]) , TeamModule],
  controllers: [DeadlinesController],
  providers: [DeadlinesService],
})
export class DeadlinesModule {}
