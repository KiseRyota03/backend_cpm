import { IsString, IsNotEmpty } from 'class-validator';

export class AddQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  contentId: string;
}
