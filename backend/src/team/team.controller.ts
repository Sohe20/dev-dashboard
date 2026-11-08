import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TeamLeadGuard } from 'src/auth/team-lead.guard';

@UseGuards(AuthGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @Get('my-role')
  myRole(@Request() req: any) {
    return this.teamService.findByUserId(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(+id);
  }

  @UseGuards(TeamLeadGuard)
  @Post()

  create(@Body() data: CreateTeamMemberDto) {
    return this.teamService.create(data);
  }

  @UseGuards(TeamLeadGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateTeamMemberDto) {
    return this.teamService.update(+id, data);
  }

  @UseGuards(TeamLeadGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamService.remove(+id);
  }
}
