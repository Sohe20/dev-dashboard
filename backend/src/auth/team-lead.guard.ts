import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TeamService } from '../team/team.service';

@Injectable()
export class TeamLeadGuard implements CanActivate {
  constructor(private teamService: TeamService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const member = await this.teamService.findByUserId(req.user.sub);
    if (member?.role !== 'Team Lead') {
      throw new ForbiddenException('Only Team Lead can do this');
    }
    return true;
  }
}