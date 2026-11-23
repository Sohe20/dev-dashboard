import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TeamLeadGuard } from '../auth/team-lead.guard';
import { DeadlinesService } from './deadlines.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

@UseGuards(AuthGuard)
@Controller('deadlines')
export class DeadlinesController {
  constructor(private readonly service: DeadlinesService) { }

  @Get()
  findByProject(@Query('projectId') projectId?: string) {
    if (!projectId) throw new BadRequestException('projectId is required');
    return this.service.findByProject(+projectId);
  }

  @UseGuards(TeamLeadGuard)
  @Post()
  create(@Body() data: CreateDeadlineDto) {
    return this.service.create(data);
  }

  @UseGuards(TeamLeadGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateDeadlineDto) {
    return this.service.update(+id, data);
  }

  @UseGuards(TeamLeadGuard)
  @Delete('completed')
  removeCompleted(@Query('projectId') projectId?: string) {
    if (!projectId) throw new BadRequestException('projectId is required');
    return this.service.removeCompleted(+projectId);
  }

  @UseGuards(TeamLeadGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}