import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  async addIssue(body, regiUser): Promise<Issue> {
    const { targetPolitician, content, title, link } = body;
    const issueData = {
      politician_id: targetPolitician,
      content: content,
      title: title,
      link: link,
      user_id: regiUser,
    };

    const result = await this.issueRepository.save(issueData);

    return result;
  }
}
