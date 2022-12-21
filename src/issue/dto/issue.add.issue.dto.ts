import {
  IsEmail,
  IsFQDN,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddIssueDto {
  @IsEmail()
  userEmail: string;

  @IsNumber()
  targetPolitician: number;

  @IsString()
  content: string;

  @IsString()
  title: string;

  @IsOptional()
  //@IsFQDN()  //www.naver.com 형식외 경로 추가되거나 프로토콜이 붙어도 모두 에러로 처리함
  link: string;
}
