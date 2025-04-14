import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export type UserDocument = User & Document;

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (value: string) => emailRegexPattern.test(value),
      message: 'Please enter a valid email address',
    },
  })
  email: string;

  @Prop({ minlength: 6, select: false })
  password: string;

  @Prop({
    type: {
      public_id: { type: String, default: '' },
      url: { type: String },
    },
  })
  avatar: {
    public_id: string;
    url: string;
  };

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: [
      {
        courseId: { type: Types.ObjectId, ref: 'Course' }, // Giả sử bạn liên kết khóa học
      },
    ],
    default: [],
  })
  courses: Array<{ courseId: Types.ObjectId }>;

  // Methods (Instance Methods)
  async comparePassword(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  SignAccessToken(): string {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
      expiresIn: '5m',
    });
  }

  SignRefreshToken(): string {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
      expiresIn: '3d',
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hook: Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
