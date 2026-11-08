import { Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findMine(@Request() req: any) {
    return this.service.findMine(req.user.sub);
  }

  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    return { count: await this.service.unreadCount(req.user.sub) };
  }

  @Put('read-all')
  readAll(@Request() req: any) {
    return this.service.markAllRead(req.user.sub);
  }

  @Put(':id/read')
  read(@Param('id') id: string, @Request() req: any) {
    return this.service.markRead(+id, req.user.sub);
  }

@Delete()
clearAll(@Request() req: any) {
  return this.service.clearAll(req.user.sub);
}
}