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
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';
import { response } from 'express';
import { PageMeta } from 'src/utils/pagination.dto';

import { AddIssueDto } from './dto/issue.add.issue.dto';
import { AddPollDto } from './dto/issue.add.poll.dto';
import { AddVoteDto } from './dto/issue.add.vote.dto';
import { QueryIssueDto } from './dto/issue.pagination.dto';

import { IssueService } from './issue.service';

@Controller('issue')
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

  @Get()
  async getIssues(@Query() issueQuery: QueryIssueDto, @Res() response) {
    try {
      const { targetPolitician, pageOptions } = issueQuery;
      console.log('pageoptions: ', pageOptions);
      const issues = await this.issueService.getIssuesForVote(
        targetPolitician,
        pageOptions,
      );

      const count = await this.issueService.getAllVoteActiveIssues(
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

  @Get(':id/top3')
  async getTop3Issues(@Param('id') politicianId: number, @Res() response) {
    try {
      const result = await this.issueService.getTop3IssuesByPolitician(
        politicianId,
      );
      const len = result.length;
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        targetPolitician: politicianId,
        result,
        len,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: err.message,
      });
    }
  }

  @Get('graph')
  async getIssuesForGraph(@Res() response) {
    try {
      const result = await this.issueService.getIssuesForGraph();
      return response
        .status(HttpStatus.OK)
        .json({ message: 'found successfully', result });
    } catch (err) {
      return response.json({
        message: err.message,
      });
    }
  }

  // 정치인 구분 없는 모든 이슈 조회임
  @Get('all')
  async getAllPollActiveIssues(@Res() response) {
    try {
      const result = await this.issueService.getAllPollActiveIssues();
      return response.status(HttpStatus.OK).json(result);
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
    const result = await this.issueService.remove(id);

    //삭제 실패시 status 코드 반영하기
    return response.status(HttpStatus.OK).json({
      message: result,
    });
  }
}
