import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PageOptionDto } from 'src/utils/pagination.dto';

export class QueryIssueDto {
  @IsOptional()
  readonly targetPolitician: number;

  @Transform(({ value }) => {
    if (value === 'true') true;
    if (value === 'false') false;
  })
  readonly regiStatus?: boolean;

  @Transform(({ value }) => {
    if (value === 'true') true;
    if (value === 'false') false;
  })
  readonly ranked?: boolean;

  @IsOptional()
  @Transform(({ value }) => +value)
  readonly pageNum?: number = 1;

  @IsOptional()
  @Transform(({ value }) => +value)
  readonly perPage?: number = 10;

  get pageOptions(): PageOptionDto {
    return new PageOptionDto(this.pageNum, this.perPage);
  }
}
