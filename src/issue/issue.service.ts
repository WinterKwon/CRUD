import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Politician } from 'src/entities/politician.entity';
import { Poll } from 'src/entities/poll.entity';
import { User } from 'src/entities/user.entity';
import { Vote } from 'src/entities/vote.entity';
import { PageOptionDto } from 'src/utils/pagination.dto';
import { In, Not, NotBrackets, Repository } from 'typeorm';
import { AddIssueDto } from './dto/issue.add.issue.dto';
import { AddPollDto } from './dto/issue.add.poll.dto';
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

    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
  ) {}

  // 이슈 추가
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

  // 그래프 등록을 위한 찬반 투표
  async castVote(voteData: AddVoteDto, issueId: number): Promise<any> {
    const { userId, agree, against } = voteData;

    //각 인스턴스 생성
    const newVote = await this.voteRepository.create();
    const voter = await this.userRepository.findOneBy({ id: userId });
    const issue = await this.issueRepository.findOneBy({ id: issueId });

    // 중복 투표 여부 체크
    const hasVoted = await this.hasVoted(userId, issueId);
    if (hasVoted) {
      throw new Error('has already voted');
      return;
    }

    newVote.voter = voter;
    newVote.issue = issue;
    if (agree === against) {
      throw new BadRequestException('invalid vote');
    }
    agree ? (newVote.agree = 1) : (newVote.against = 1);

    const result = await this.voteRepository.save(newVote);

    // isPollActive 상태 변경 필요한지 체크
    // 테스트위해 임의로 임계점 3 설정
    // [TODO] threshold = 75로 변경하기
    await this.setVotePollStatus(issueId, 3);

    return result;
  }

  // vote, poll 상태 변경 함수 분리
  // 찬성이 75이상, 반대의 3배 이상이면 투표 가능 상태로 변경
  async setVotePollStatus(issueId: number, threshold: number) {
    try {
      const { agreeCount, againstCount } = await this.getAgreeAgainstCount(
        issueId,
      );
      if (agreeCount > threshold && agreeCount >= againstCount * 3) {
        return await this.issueRepository
          .createQueryBuilder()
          .update(Issue)
          .set({ isPollActive: true, isVoteActive: false })
          .where('id = :issueId', { issueId })
          .execute();
      }
    } catch (err) {
      throw new Error('failed to update vote poll status');
    }
  }

  // 이슈 찬반 투표 집계
  async getAgreeAgainstCount(issueId: number) {
    const agreeCount = await this.voteRepository
      .createQueryBuilder('vote')
      .where('vote.issue_id = :issueId', { issueId: issueId })
      .andWhere('vote.agree = :agree', { agree: 1 })
      .getCount();

    const againstCount = await this.voteRepository
      .createQueryBuilder('vote')
      .where('vote.issue_id = :issueId', { issueId: issueId })
      .andWhere('vote.against = :against', { against: 1 })
      .getCount();

    return {
      issueId: issueId,
      agreeCount: agreeCount,
      againstCount: againstCount,
    };
  }

  // 중복 투표 체크
  async hasVoted(userId: number, issueId: number): Promise<boolean> {
    const result = await this.voteRepository
      .createQueryBuilder('vote')
      .where('vote.user_id = :userId ', { userId })
      .andWhere('vote.issue_id= :issueId', { issueId })
      .getOne();

    return result ? true : false;
  }

  // 그래프에 등록된 이슈에 OXㅅ 투표
  async castPoll(pollData: AddPollDto, issueId: number) {
    const { userId, pro, con, neu } = pollData;

    //oxㅅ 투표 유효성 검증
    if ([pro, con, neu].filter((e) => e === 1).length !== 1) {
      throw new Error(' invalid poll');
    }

    // user 유효성 검증
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('invalid user');
    }

    // 각 인스턴스 생성
    const issue = await this.issueRepository.findOneBy({ id: issueId });
    const poller = await this.userRepository.findOneBy({ id: userId });
    const newPoll = this.pollRepository.create();

    // 투표 결과 반영
    newPoll.poller = poller;
    newPoll.issue = issue;
    if (pro) newPoll.pro = 1;
    else if (con) newPoll.con = 1;
    else newPoll.neu = 1;
    const tribe = poller.tribe;
    newPoll[`${tribe}`] = 1;

    // 투표 결과 저장
    const result = await this.pollRepository.save(newPoll);

    return result;
  }

  //그래프 등록임박 top3
  async getTop3IssuesByPolitician(politicianId: number) {
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.votes', 'vote')
      .leftJoinAndSelect('issue.politician', 'politician')
      .select(['issue.id', 'issue.title', 'issue.content', 'issue.issueDate'])
      .where('issue.isVoteActive = :isVoteActive', { isVoteActive: true })
      .andWhere('issue.politician = :politician', { politician: politicianId })
      .groupBy('vote.issue')
      .addSelect('SUM(vote.agree)', 'agree')
      .addSelect('SUM(vote.against)', 'against')
      .orderBy('SUM(vote.agree) - SUM(vote.against)', 'DESC')
      .limit(3)
      .getRawMany();

    return issues;
  }

  //그래프등록에 대한 찬반 투표 isVoteActive : true 이슈 페이지네이션
  async getIssuesForVote(targetPolitician: number, pageOptions: PageOptionDto) {
    const top3 = await this.getTop3IssuesByPolitician(targetPolitician);
    const top3Issues = Array.from(top3).map((e) => e.issue_id);
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.politician', 'politician')
      .leftJoinAndSelect('issue.votes', 'vote')
      .select([
        'issue.id',
        'issue.title as title',
        'issue.content as content',
        'issue.link as link',
        'issue.issueDate as issueDate',
        'politician.id',
        'sum(vote.agree) as agree',
        'sum(vote.against) as against',
      ])
      .where('issue.isVoteActive = :isVoteActive', { isVoteActive: true })
      .andWhere('politician.id = :politician', {
        politician: targetPolitician,
      })
      .andWhere('issue.id NOT IN (:...top3)', { top3: top3Issues })
      .groupBy('issue.id')
      .orderBy('issue.issueDate', 'DESC')
      .offset(pageOptions.skip)
      .limit(pageOptions.perPage)
      .getRawMany();
    console.log(pageOptions.skip);
    console.log(pageOptions.perPage);
    return issues;
  }

  //top3 제외 isVoteActive:true인 이슈 갯수 카운트
  async getVoteActiveIssuesByPolitician(targetPolitician: number) {
    const top3 = await this.getTop3IssuesByPolitician(targetPolitician);
    const top3Issues = Array.from(top3).map((e) => e.issue_id);
    const count = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.politician', 'politician')
      .leftJoinAndSelect('issue.votes', 'vote')
      .where('issue.isVoteActive = :isVoteActive', { isVoteActive: true })
      .andWhere('politician.id = :politician', {
        politician: targetPolitician,
      })
      .andWhere('issue.id NOT IN (:...top3)', { top3: top3Issues })
      .getCount();

    return count;
  }

  // 정치인 상세 페이지 그래프용 이슈 isPollActive: true 40개
  async getPollActiveIssuesByPolitician(targetPolitician: number) {
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.polls', 'poll')
      .select([
        'issue.politician as targetPolitician',
        'issue.id as issueId',
        'issue.title as title',
        'issue.content as content',
        'SUM(poll.tiger) as tiger',
        'SUM(poll.hippo) as hippo',
        'SUM(poll.dinosaur) as dinosaur',
        'SUM(poll.lion) as lion',
        'SUM(poll.pro) as pro',
        'SUM(poll.con) as con',
        'SUM(poll.neu) as neu',
        'SUM(poll.pro) - SUM(poll.con) as score',
      ])
      .where('issue.isPollActive = :isPollActive', { isPollActive: true })
      .andWhere('issue.politician = :politician', {
        politician: targetPolitician,
      })
      // .groupBy('issue.politician')
      .addGroupBy('poll.issue')
      .orderBy('issue.politician')
      .addOrderBy('poll.pollDate', 'DESC')
      .limit(40)
      .getRawMany();
    return issues;
  }

  //그래프에서 투표할 수 있는 (isPollActive : true)전체 이슈 조회
  async getAllPollActiveIssues() {
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.polls', 'poll')
      .leftJoinAndSelect('issue.politician', 'politician')
      .where('issue.isPollActive = :isPollActive', { isPollActive: true })
      .groupBy('issue.politician')
      .addSelect('SUM(poll.pro) - SUM(poll.con)', 'total')
      .orderBy('poll.pollDate', 'DESC')
      .getMany();
    return issues;
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
