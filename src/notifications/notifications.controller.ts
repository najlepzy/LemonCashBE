import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsGateway: NotificationsGateway) {}

  @Get('test')
  test(@Query('userId') userId: string) {
    const payload = { message: 'Test message from the backend' };
    this.notificationsGateway.sendCollaboratorInvite(Number(userId), payload);
    return { message: 'Event emitted' };
  }
}
