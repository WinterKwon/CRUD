import { IsString } from 'class-validator';

export class AddPoliticianDto {
  @IsString()
  name: string;

  @IsString()
  image?: string;

  @IsString()
  party?: string;
}
