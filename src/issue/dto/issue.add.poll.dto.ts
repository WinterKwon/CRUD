import { IsNumber, IsOptional } from 'class-validator';

export class AddPollDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  pro: number;

  @IsOptional()
  con: number;

  @IsOptional()
  neu: number;
}
