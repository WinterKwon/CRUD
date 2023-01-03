export class PageOptionDto {
  constructor(pageNum: number, perPage: number) {
    this.pageNum = pageNum;
    this.perPage = perPage;
  }
  readonly pageNum?: number;
  readonly perPage?: number;
  //[TODO] get 으로 두지 않고 서비스층에서 호출해도 정상작동하는지 목업 데이터 반영후 확인하기
  get skip(): number {
    return (this.pageNum - 1) * this.perPage;
  }
}
