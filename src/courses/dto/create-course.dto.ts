import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class Benefit {
  @IsString()
  @IsNotEmpty()
  title: string;
}

class Prerequisite {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  categories?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  estimatedPrice?: number;

  @IsString()
  @IsOptional()
  thumbnail?: string; // This will likely be URL or public_id in frontend

  @IsString()
  @IsNotEmpty()
  tags: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  demoUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Benefit)
  benefits: Benefit[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Prerequisite)
  prerequisites: Prerequisite[];
}
