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
import {TeamLeadGuard} from "../auth/team-lead.guard"

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

@Get()
findAll(@Request() req: any, @Query('projectId') projectId?: string) {
  return this.tasksService.findAll(projectId ? +projectId : undefined, req.user.sub);
}

  

  @Get('my-tasks')
  myTasks(@Request() req: any) {
    return this.tasksService.findByAssignee(req.user.sub);
  }

  @Get('user/:id')
  findByUser(@Param('id') id: string) {
    return this.tasksService.findByUser(+id);
  }

  @Get('activity')
  getActivity(){
    return this.tasksService.getActivityData();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @UseGuards(TeamLeadGuard)
  @Post()
  create(@Body() data: CreateTaskDto, @Request() req: any) {
    data.assignedById = req.user.sub;
    return this.tasksService.create(data);
  }

  @UseGuards(TeamLeadGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.tasksService.update(+id, data);
  }

  @UseGuards(TeamLeadGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }


    @Post(':id/complete')
  complete(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.complete(+id, req.user.sub);
  }

  @Post(':id/report-issue')
  reportIssue(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: any,
  ) {
    return this.tasksService.reportIssue(+id, req.user.sub, message);
  }

  @UseGuards(TeamLeadGuard)
  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.approve(+id, req.user.sub);
  }

  @UseGuards(TeamLeadGuard)
  @Post(':id/send-back')
  sendBack(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: any,
  ) {
    return this.tasksService.sendBack(+id, req.user.sub, message);
  }
}
