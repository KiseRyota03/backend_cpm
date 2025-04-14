import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { ActivationDto } from './dto/activation.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtService } from 'src/common/services/jwt.service';
import { MailerService } from 'src/common/services/mailer.service';
import { RedisService } from 'src/common/services/redis.service';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Register
  async register(body: RegisterDto, res: Response) {
    const { name, email, password, confirmPassword } = body;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    if (password !== confirmPassword) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const activationToken = this.jwtService.signActivationToken({
      name,
      email,
      password,
    });
    const activationCode =
      this.jwtService.extractActivationCode(activationToken);

    const html = await this.mailerService.renderTemplate(
      'activation-mail.ejs',
      {
        user: { name },
        activationCode,
      },
    );

    await this.mailerService.sendMail(email, 'Activate your account', html);

    res.status(201).json({
      success: true,
      message: `Please check your email: ${email} to activate your account!`,
      activationToken,
    });
  }

  // Activate User
  async activateUser(body: ActivationDto, res: Response) {
    const { activation_token, activation_code } = body;

    const decoded = this.jwtService.verifyActivationToken(activation_token);

    if (decoded.activationCode !== activation_code) {
      throw new HttpException(
        'Invalid activation code',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { name, email, password } = decoded.user;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    await this.userModel.create({ name, email, password });

    res
      .status(201)
      .json({ success: true, message: 'Account activated successfully' });
  }

  // Login
  async login(body: LoginDto, res: Response) {
    const { email, password } = body;

    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    await this.redisService.set(
      user._id.toString(),
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.cookie(
      'access_token',
      accessToken,
      this.jwtService.accessTokenOptions(),
    );
    res.cookie(
      'refresh_token',
      refreshToken,
      this.jwtService.refreshTokenOptions(),
    );

    res.status(200).json({ success: true, user });
  }

  // Logout
  async logout(req: Request, res: Response) {
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });

    const userId = req.user?._id?.toString();
    if (userId) {
      await this.redisService.del(userId);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  // Refresh Access Token
  async updateAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN || '',
    ) as any;

    const session = await this.redisService.get(decoded.id);
    if (!session) {
      throw new HttpException('Session expired', HttpStatus.UNAUTHORIZED);
    }

    const user = JSON.parse(session);

    const newAccessToken = this.jwtService.signAccessToken(user._id);
    const newRefreshToken = this.jwtService.signRefreshToken(user._id);

    await this.redisService.set(
      user._id,
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.cookie(
      'access_token',
      newAccessToken,
      this.jwtService.accessTokenOptions(),
    );
    res.cookie(
      'refresh_token',
      newRefreshToken,
      this.jwtService.refreshTokenOptions(),
    );

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }

  // Get User Info
  async getUserInfo(req: Request, res: Response) {
    const userId = req.user?._id;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    res.status(200).json({ success: true, user });
  }

  // Social Auth
  async socialAuth(body: SocialAuthDto, res: Response) {
    const { email, name, avatar } = body;

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = await this.userModel.create({
        name,
        email,
        avatar: { public_id: 'default', url: avatar },
      });
    } else {
      if (user.avatar?.url !== avatar) {
        user.avatar.url = avatar;
        await user.save();
      }
    }

    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    await this.redisService.set(
      user._id.toString(),
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.cookie(
      'access_token',
      accessToken,
      this.jwtService.accessTokenOptions(),
    );
    res.cookie(
      'refresh_token',
      refreshToken,
      this.jwtService.refreshTokenOptions(),
    );

    res.status(200).json({ success: true, user });
  }

  // Update Info
  async updateUserInfo(body: UpdateInfoDto, req: Request, res: Response) {
    const userId = req.user?._id;
    const { name, email } = body;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (email) {
      const exists = await this.userModel.findOne({ email });
      if (exists) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    await this.redisService.set(
      userId.toString(),
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.status(200).json({ success: true, user });
  }

  // Update Password
  async updatePassword(body: UpdatePasswordDto, req: Request, res: Response) {
    const { oldPassword, newPassword } = body;
    const userId = req.user?._id;

    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new HttpException('Incorrect old password', HttpStatus.BAD_REQUEST);
    }

    user.password = newPassword;
    await user.save();

    await this.redisService.set(
      userId.toString(),
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.status(200).json({ success: true, user });
  }

  // Update Profile Picture
  async updateProfilePicture(
    file: Express.Multer.File,
    req: Request,
    res: Response,
  ) {
    const userId = req.user?._id;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.avatar?.public_id) {
      await this.cloudinaryService.delete(user.avatar.public_id);
    }

    const uploaded = await this.cloudinaryService.upload(
      file.buffer,
      'avatars',
    );

    user.avatar = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };

    await user.save();
    await this.redisService.set(
      userId.toString(),
      JSON.stringify(user),
      7 * 24 * 60 * 60,
    );

    res.status(200).json({ success: true, user });
  }

  // Admin - Get All Users
  async getAllUsers(res: Response) {
    const users = await this.userModel.find();
    res.status(200).json({ success: true, users });
  }

  // Admin - Update User Role
  async updateUserRole(body: { email: string; role: string }, res: Response) {
    const { email, role } = body;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, user });
  }

  // Admin - Delete User
  async deleteUser(id: string, res: Response) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await user.deleteOne();
    await this.redisService.del(id);

    res
      .status(200)
      .json({ success: true, message: 'User deleted successfully' });
  }
}
