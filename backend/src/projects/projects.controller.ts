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

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.sub);
  }

  @Get('revenue')
  getRevenue() {
    return this.projectsService.getTotalRevenue();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Post()
  create(@Body() data: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(data, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}