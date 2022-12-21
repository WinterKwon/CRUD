import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class Issues4GraphDto {
  @IsNumber()
  targetPolitician: number;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  @IsBoolean()
  readonly regiStatus: boolean;

  @Transform(({ value }) => +value)
  @IsNumber()
  readonly perPage: number;

  @Transform(({ value }) => +value)
  @IsNumber()
  readonly pageNum: number;
}
