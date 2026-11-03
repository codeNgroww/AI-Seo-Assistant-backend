import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FaqItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Question cannot be empty' })
  question: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer cannot be empty' })
  answer: string;
}

export class UpdateDraftDto {
  @IsString()
  @IsNotEmpty({ message: 'SEO Title is required' })
  @MaxLength(100, { message: 'SEO Title exceeds system limit' })
  seoTitle: string;

  @IsString()
  @IsNotEmpty({ message: 'Meta Description is required' })
  @MaxLength(300, { message: 'Meta Description exceeds system limit' })
  metaDescription: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs: FaqItemDto[];

  @IsOptional()
  @IsString()
  editNotes?: string;
}
