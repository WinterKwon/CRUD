import { Transform } from 'class-transformer';
import { PageOptionDto } from 'src/utils/pagination.dto';

export class QueryIssueDto {
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

  @Transform(({ value }) => +value)
  readonly pageNum?: number = 1;

  @Transform(({ value }) => +value)
  readonly perPage?: number = 10;

  pageOptions(): PageOptionDto {
    return new PageOptionDto(this.pageNum, this.perPage);
  }
}
