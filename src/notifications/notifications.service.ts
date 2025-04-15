// src/notifications/notifications.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 });
  }

  async updateNotificationStatus(id: string): Promise<Notification[]> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) throw new NotFoundException('Notification not found');

    if (notification.status !== 'read') {
      notification.status = 'read';
      await notification.save();
    }

    return this.getAllNotifications();
  }

  async deleteOldReadNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.notificationModel.deleteMany({
      status: 'read',
      createdAt: { $lt: thirtyDaysAgo },
    });
  }
}
