import { IsString, IsNotEmpty } from 'class-validator';

export class SocialAuthDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;
}
