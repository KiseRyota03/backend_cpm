import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MailerService } from 'src/common/services/mailer.service';
import { RedisService } from 'src/common/services/redis.service';
import { JwtService } from 'src/common/services/jwt.service';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    MailerService,
    RedisService,
    JwtService,
    CloudinaryService,
  ],
})
export class UsersModule {}
