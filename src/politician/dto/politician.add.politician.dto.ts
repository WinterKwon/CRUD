import { IsOptional, IsString } from 'class-validator';

export class AddPoliticianDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  party?: string;
}
