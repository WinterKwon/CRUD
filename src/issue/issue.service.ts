import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Politician } from 'src/entities/politician.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AddIssueDto } from './dto/issue.add.issue.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Politician)
    private politicianRepository: Repository<Politician>,
  ) {}

  async addIssue(body: AddIssueDto, regiUser: number): Promise<Issue> {
    const { targetPolitician, content, title, link } = body;

    const issueData = {
      content: content,
      title: title,
      link: link,
    };
    const issue = this.issueRepository.create(issueData);
    const user = await this.userRepository.findOneBy({ id: regiUser });
    const politician = await this.politicianRepository.findOneBy({
      id: targetPolitician,
    });

    issue.user = user;
    issue.politician = politician;

    const result = await this.issueRepository.save(issue);

    return result;
  }

  //async getAllIssues():Promise<Issue[]> {
  //   return await this.issueRepository.find();
  // }

  async remove(id: number): Promise<any> {
    const exitedIssue = await this.issueRepository.findOneBy({ id });
    if (!exitedIssue) {
      return 'could not find such an issue';
    }
    await this.issueRepository.delete(id);
    return `successfully deleted issue Id ${id}`;
  }
}
