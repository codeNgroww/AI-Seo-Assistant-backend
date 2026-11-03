import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateSeoDto {
  @IsNotEmpty({ message: 'Page title is required' })
  @IsString()
  @MinLength(3, { message: 'Page title must be at least 3 characters' })
  @MaxLength(200, { message: 'Page title cannot exceed 200 characters' })
  pageTitle: string;

  @IsNotEmpty({ message: 'Page description is required' })
  @IsString()
  @MinLength(10, { message: 'Page description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Page description cannot exceed 1000 characters' })
  pageDescription: string;

  @IsOptional()
  @IsBoolean()
  allowRedact?: boolean;
}
