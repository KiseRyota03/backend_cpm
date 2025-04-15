// src/orders/orders.controller.ts

import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Request, Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard'; // tùy bạn đặt guard thế nào
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly coursesService: CoursesService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateOrderDto,
  ) {
    try {
      const { courseId, payment_info } = body;
      const user = await this.usersService.findById(req.user._id);

      const hasCourse = user?.courses?.some(
        (course: any) => course._id.toString() === courseId,
      );

      if (hasCourse) {
        throw new HttpException(
          'You have already purchased this course',
          HttpStatus.BAD_REQUEST,
        );
      }

      const course = await this.coursesService.findById(courseId);
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      const mailData = {
        order: {
          _id: courseId.slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      };

      await this.mailService.sendMail({
        email: user.email,
        subject: 'Order Confirmation',
        template: 'order-confirmation.ejs',
        data: mailData,
      });

      user.courses.push({ courseId });
      await user.save();

      await this.notificationsService.create({
        user: user._id,
        title: 'New Order',
        message: `You have a new order from ${course.name}`,
      });

      course.purchased += 1;
      await course.save();

      const result = await this.ordersService.createOrder({
        courseId: course._id.toString(),
        userId: user._id.toString(),
        payment_info,
      });

      return res.status(201).json(result);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @UseGuards(AuthGuard)
  @Get('admin')
  async getAdminOrders(@Res() res: Response) {
    try {
      const result = await this.ordersService.getAllOrders();
      return res.status(200).json(result);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserOrders(@Req() req: Request, @Res() res: Response) {
    try {
      const userOrders = await this.ordersService.findOrdersByUser(
        req.user._id,
      );
      if (userOrders.length === 0) {
        return res.status(200).json({ message: 'No orders found' });
      }

      return res.status(200).json({
        success: true,
        orders: userOrders,
      });
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
