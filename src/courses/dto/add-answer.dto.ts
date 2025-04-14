import { IsString, IsNotEmpty } from 'class-validator';

export class AddAnswerDto {
  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  contentId: string;

  @IsString()
  @IsNotEmpty()
  questionId: string;
}
