import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Object })
  payment_info: Record<string, any>; // hoặc dùng object tùy vào kiểu dữ liệu bạn cần
}

export const OrderSchema = SchemaFactory.createForClass(Order);
