import { IsString, IsNotEmpty } from 'class-validator';

export class AddReplyDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  reviewId: string;
}
