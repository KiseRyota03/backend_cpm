import { IsString, IsOptional } from 'class-validator';

export class UpdateInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
