import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}
