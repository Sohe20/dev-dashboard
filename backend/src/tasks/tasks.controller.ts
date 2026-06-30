import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.tasksService.findAll(projectId ? +projectId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Get('my-tasks')
  myTasks(@Request() req: any) {
    return this.tasksService.findByAssignee(req.user.sub);
  }

  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.tasksService.findByUser(+id);
  }

  
  @Post()
  create(@Body() data: CreateTaskDto, @Request() req: any) {
    data.assignedById = req.user.sub;
    return this.tasksService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.tasksService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
