import {
  Body,
  Controller,
  Param,
  HttpStatus,
  Post,
  Res,
  Delete,
} from '@nestjs/common';
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata';
import { AddIssueDto } from './dto/issue.add.issue.dto';
import { AddVoteDto } from './dto/issue.add.vote.dto';

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
      const newVote = this.issueService.castVote(voteData, issueId);
      if (newVote) {
        return response.status(HttpStatus.OK).json({
          message: 'cast a vote successfully',
          newVote,
        });
      }
    } catch (err) {}
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
