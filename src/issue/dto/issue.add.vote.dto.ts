import { IsNumber, IsOptional } from 'class-validator';

export class AddVoteDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  issueId: number;

  @IsOptional()
  agree: boolean;

  @IsOptional()
  against: boolean;
}
