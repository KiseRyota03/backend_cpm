import { IsString, IsNotEmpty } from 'class-validator';

export class ActivationDto {
  @IsString()
  @IsNotEmpty()
  activation_token: string;

  @IsString()
  @IsNotEmpty()
  activation_code: string;
}
