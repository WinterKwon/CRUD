import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Politician } from 'src/entities/politician.entity';
import { User } from 'src/entities/user.entity';
import { Vote } from 'src/entities/vote.entity';
import { Repository } from 'typeorm';
import { AddIssueDto } from './dto/issue.add.issue.dto';
import { AddVoteDto } from './dto/issue.add.vote.dto';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Politician)
    private politicianRepository: Repository<Politician>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
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

  async castVote(voteData: AddVoteDto, issueId: number): Promise<any> {
    const { userId, agree, against } = voteData;
    const newVote = await this.voteRepository.create();
    const voter = await this.userRepository.findOneBy({ id: userId });
    const issue = await this.issueRepository.findOneBy({ id: issueId });
    const hasVoted = await this.hasVoted(userId, issueId);

    if (hasVoted) {
      throw new Error('has already voted');
    } else {
      newVote.voter = voter;
      newVote.issue = issue;
      if (agree === against) {
        throw new BadRequestException();
      }
      agree ? (newVote.agree = 1) : (newVote.against = 1);

      const result = await this.voteRepository.save(newVote);
      return result;
    }
  }

  async hasVoted(userId: number, issueId: number): Promise<boolean> {
    const result = await this.voteRepository
      .createQueryBuilder('vote')
      .where('vote.user_id = :userId ', { userId })
      .andWhere('vote.issue_id= :issueId', { issueId })
      .getOne();

    return result ? true : false;
  }

  async remove(id: number): Promise<any> {
    const exitedIssue = await this.issueRepository.findOneBy({ id });
    if (!exitedIssue) {
      return 'could not find such an issue';
    }
    await this.issueRepository.delete(id);
    return `successfully deleted issue Id ${id}`;
  }
}
