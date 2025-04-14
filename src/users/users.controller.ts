import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Req,
  Res,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { ActivationDto } from './dto/activation.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Register
  @Post('register')
  register(@Body() body: RegisterDto, @Res() res: Response) {
    return this.usersService.register(body, res);
  }

  // Activate account
  @Post('activate')
  activate(@Body() body: ActivationDto, @Res() res: Response) {
    return this.usersService.activateUser(body, res);
  }

  // Login
  @Post('login')
  login(@Body() body: LoginDto, @Res() res: Response) {
    return this.usersService.login(body, res);
  }

  // Logout
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return this.usersService.logout(req, res);
  }

  // Refresh access token
  @Get('refresh')
  refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    return this.usersService.updateAccessToken(req, res);
  }

  // Get user profile
  @Get('profile')
  getProfile(@Req() req: Request, @Res() res: Response) {
    return this.usersService.getUserInfo(req, res);
  }

  // Social Authentication
  @Post('social-auth')
  socialAuth(@Body() body: SocialAuthDto, @Res() res: Response) {
    return this.usersService.socialAuth(body, res);
  }

  // Update User Info
  @Put('update-info')
  updateUserInfo(
    @Body() body: UpdateInfoDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.usersService.updateUserInfo(body, req, res);
  }

  // Update Password
  @Put('update-password')
  updatePassword(
    @Body() body: UpdatePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.usersService.updatePassword(body, req, res);
  }

  // Update Profile Picture
  // @Put('update-avatar')
  // @UseInterceptors(FileInterceptor('avatar'))
  // updateAvatar(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   return this.usersService.updateProfilePicture(file, req, res);
  // }

  // Admin - Get all users
  @Get('admin/all')
  getAllUsers(@Res() res: Response) {
    return this.usersService.getAllUsers(res);
  }

  // Admin - Update user role
  @Put('admin/update-role')
  updateUserRole(
    @Body() body: { email: string; role: string },
    @Res() res: Response,
  ) {
    return this.usersService.updateUserRole(body, res);
  }

  // Admin - Delete user
  @Delete('admin/delete/:id')
  deleteUser(@Param('id') id: string, @Res() res: Response) {
    return this.usersService.deleteUser(id, res);
  }
}
