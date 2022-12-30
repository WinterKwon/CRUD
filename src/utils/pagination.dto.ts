export class PageOptionDto {
  constructor(pageNum: number, perPage: number) {
    this.pageNum = pageNum;
    this.perPage = perPage;
  }
  readonly pageNum?: number;
  readonly perPage?: number;
  skip(): number {
    return (this.pageNum - 1) * this.perPage;
  }
}
