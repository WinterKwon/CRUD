import { Body, Controller, Post, Req, Res } from '@nestjs/common';

import { IssueService } from './issue.service';

@Controller('issue')
export class IssueController {
  constructor(private issueService: IssueService) {}

  @Post()
  async addIssue(@Body() issueData, @Req() request, @Res() response) {
    try {
      const regiUser = issueData.user_id;
      const issue = await this.issueService.addIssue(issueData, regiUser);
      if (issue) {
        return response.json({
          message: 'createdIssue successfully',
        });
      }
    } catch (err) {
      return response.json({
        message: 'failed to create issue',
      });
    }
  }
}
