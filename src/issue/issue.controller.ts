import {
  Body,
  Controller,
  Param,
  HttpStatus,
  Post,
  Res,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { PageMeta } from 'src/utils/pagination.dto';
import { AddIssueDto } from './dto/issue.add.issue.dto';
import { AddPollDto } from './dto/issue.add.poll.dto';
import { AddVoteDto } from './dto/issue.add.vote.dto';
import { QueryIssueDto } from './dto/issue.pagination.dto';
import { IssueService } from './issue.service';

@Controller('issues')
export class IssueController {
  constructor(private issueService: IssueService) {}

  @Post()
  async addIssue(@Body() issueData: AddIssueDto, @Res() response) {
    try {
      // const regiUser = issueData.userEmail;
      const regiUser = issueData.userId;
      const issue = await this.issueService.addIssue(issueData, regiUser);
      console.log(issue);
      if (issue) {
        return response.json({
          message: 'created Issue successfully',
          issue,
        });
      }
    } catch (err) {
      return response.json({
        message: 'failed to create issue',
      });
    }
  }

  // 그래프 등록에 대한 찬반 투표
  @Post(':id/vote')
  async createVote(
    @Body() voteData: AddVoteDto,
    @Param('id') issueId: number,
    @Res() response,
  ) {
    try {
      const newVote = await this.issueService.castVote(voteData, issueId);
      if (newVote) {
        return response.status(HttpStatus.OK).json({
          message: 'cast a vote successfully',
          newVote,
        });
      }
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: err.message,
      });
    }
  }

  //oxㅅ 투표
  @Post(':id/poll')
  async createPoll(
    @Body() pollData: AddPollDto,
    @Param('id') issueId: number,
    @Res() response,
  ) {
    try {
      const newPoll = await this.issueService.castPoll(pollData, issueId);
      if (newPoll) {
        return response.status(HttpStatus.OK).json({
          message: 'cast a poll successfully',
          newPoll,
        });
      }
    } catch (err) {
      return response.json({
        message: err.message,
      });
    }
  }

  // top3 제외 찬반 투표 가능한 이슈 - 페이지네이션
  // 쿼리로 정치인 id, pageNum, perPage 요청 받음
  // 디폴트는 pageNum=1, perPage=10
  @Get('vote')
  async getIssuesForVote(@Query() issueQuery: QueryIssueDto, @Res() response) {
    try {
      const { targetPolitician, pageOptions } = issueQuery;
      console.log('pageoptions: ', pageOptions);
      const issues = await this.issueService.getIssuesForVote(
        targetPolitician,
        pageOptions,
      );

      const count = await this.issueService.getVoteActiveIssuesByPolitician(
        targetPolitician,
      );

      const meta = new PageMeta(
        pageOptions.pageNum,
        pageOptions.perPage,
        count,
      );

      return response.json({ data: issues, meta: meta });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: err.message,
      });
    }
  }

  // 그래프 미등록 이슈 중 등록 임박 top3 조회
  @Get('vote/top3')
  async getTop3Issues(@Query() issueQuery: QueryIssueDto, @Res() response) {
    try {
      const { targetPolitician } = issueQuery;
      const result = await this.issueService.getTop3IssuesByPolitician(
        targetPolitician,
      );
      const len = result.length;
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        targetPolitician: targetPolitician,
        result,
        len,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: err.message,
      });
    }
  }

  // 정치인별 OXㅅ 투표 가능한 그래프용 이슈 조회
  // 부족별 투표 결과 조회됨
  @Get('poll')
  async getIssuesForGraph(@Query() issueQuery: QueryIssueDto, @Res() response) {
    try {
      const { targetPolitician } = issueQuery;
      const result = await this.issueService.getPollActiveIssuesByPolitician(
        targetPolitician,
      );
      return response
        .status(HttpStatus.OK)
        .json({ message: 'found successfully', result });
    } catch (err) {
      return response.json({
        message: err.message,
      });
    }
  }

  @Get(':id/vote-result')
  async getAllAgreeAgainstByIssue(
    @Param('id') issueId: number,
    @Res() response,
  ) {
    try {
      const result = await this.issueService.getAgreeAgainstCount(issueId);
      return response
        .status(HttpStatus.OK)
        .json({ message: 'found successfully', result });
    } catch (err) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: err.message });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() response) {
    try {
      const result = await this.issueService.remove(id);
      return response.status(HttpStatus.OK).json({
        message: result,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'failed to delete',
      });
    }
  }
}
