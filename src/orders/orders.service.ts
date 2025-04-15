import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  // Create new order
  async createOrder(
    data: Partial<Order>,
  ): Promise<{ success: boolean; order: Order }> {
    const order = await this.orderModel.create(data);
    return {
      success: true,
      order,
    };
  }

  // Get all orders
  async getAllOrders(): Promise<{ success: boolean; orders: Order[] }> {
    const orders = await this.orderModel.find().sort({ createdAt: -1 });
    return {
      success: true,
      orders,
    };
  }
}
