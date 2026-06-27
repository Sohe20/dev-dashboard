import { Injectable } from '@nestjs/common';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamMember } from './entities/team-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private teamRepository: Repository<TeamMember>,
  ) {}

  findAll(): Promise<TeamMember[]> {
    return this.teamRepository.find();
  }

  findOne(id: number): Promise<TeamMember | null> {
    return this.teamRepository.findOneBy({ id });
  }

  create(data: CreateTeamMemberDto): Promise<TeamMember> {
    const member = this.teamRepository.create(data);
    return this.teamRepository.save(member);
  }

  async update(id: number,data: UpdateTeamMemberDto,): Promise<TeamMember | null> {
    await this.teamRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    await this.teamRepository.delete(id);
    return { deleted: true };
  }
}
