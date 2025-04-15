// src/notifications/notifications.controller.ts

import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll() {
    const notifications = await this.notificationsService.getAllNotifications();
    return { success: true, notifications };
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string) {
    const notifications =
      await this.notificationsService.updateNotificationStatus(id);
    return { success: true, notifications };
  }
}
