import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class AddReviewDto {
  @IsString()
  @IsNotEmpty()
  review: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
