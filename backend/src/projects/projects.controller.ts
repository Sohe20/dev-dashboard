import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TeamLeadGuard } from 'src/auth/team-lead.guard';

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.sub);
  }

  @UseGuards(TeamLeadGuard)
  @Get('revenue')
  getRevenue() {
    return this.projectsService.getTotalRevenue();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @UseGuards(TeamLeadGuard)
  @Post()
  create(@Body() data: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(data, req.user.sub);
  }

  @UseGuards(TeamLeadGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(+id, data);
  }

  @UseGuards(TeamLeadGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}