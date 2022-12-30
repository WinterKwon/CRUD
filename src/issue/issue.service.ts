import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Politician } from 'src/entities/politician.entity';
import { Poll } from 'src/entities/poll.entity';
import { User } from 'src/entities/user.entity';
import { Vote } from 'src/entities/vote.entity';
import { PageOptionDto } from 'src/utils/pagination.dto';
import { Repository } from 'typeorm';
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

  //async getAllIssues():Promise<Issue[]> {
  //   return await this.issueRepository.find();
  // }

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
    } else {
      newVote.voter = voter;
      newVote.issue = issue;
      if (agree === against) {
        throw new BadRequestException();
      }
      agree ? (newVote.agree = 1) : (newVote.against = 1);

      const result = await this.voteRepository.save(newVote);

      // isPollActive 상태 변경 필요한지 체크
      const [agreeCount, againstCount] = await this.getAgreeAgainstCount(
        issueId,
      );

      // 테스트위해 임의로 3 설정
      // [TODO] threshold = 75로 변경하기
      const threshold = 3;
      if (agreeCount > threshold && agreeCount >= againstCount * 3) {
        return await this.issueRepository
          .createQueryBuilder()
          .update(Issue)
          .set({ isPollActive: true, isVoteActive: false })
          .where('id = :issueId', { issueId })
          .execute();
      }

      return result;
    }
  }

  // 이슈 찬반 투표 집계
  async getAgreeAgainstCount(issueId: number) {
    // isPollActive 상태 변경 필요 여부 확인 및 실행
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

    return [agreeCount, againstCount];
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
  async castPoll(pollData: AddPollDto, issueId) {
    const { userId, pro, con, neu } = pollData;

    //oxㅅ 투표 유효성 검증
    if (
      [pro, con, neu].filter((value) => {
        return value !== undefined && value !== null;
      }).length !== 1
    )
      throw new Error(' invalid poll');

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
  async getTop3Issues() {
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.votes', 'vote')
      .where('issue.isVoteActive = :isVoteActive', { isVoteActive: true })
      .groupBy('vote.issue')
      .orderBy('COUNT(vote.agree - vote.against)')
      .limit(3)
      .getMany();
    return issues;
  }

  //그래프 미등록 찬반 투표 오픈 이슈 페이지네이션
  async getIssuesForVote(targetPolitician: number, pageOption: PageOptionDto) {
    const issues = await this.issueRepository.find({
      relations: {
        politician: true,
      },
      order: {
        issueDate: 'DESC',
      },
      skip: pageOption.skip(),
      take: pageOption.perPage,
    });
    return issues;
  }

  // 정치인 상세 페이지 그래프용 이슈 10개 -> 그래프페이지네이션 40개
  async getIssuesForGraph() {
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.polls', 'poll')
      .where('issue.isPollActive = :isPollActive', { isPollActive: true })
      .groupBy('poll.issue')
      .addSelect('SUM(poll.tiger)', 'totalTiger')
      .addSelect('SUM(poll.hippo)', 'totalHippo')
      .addSelect('SUM(poll.elephant)', 'totalHippo')
      .addSelect('SUM(poll.dinosaur)', 'totalDino')
      .addSelect('SUM(poll.lion)', 'totalLion')
      .addSelect('SUM(poll.pro)', 'totalPro')
      .addSelect('SUM(poll.con)', 'totalCon')
      .addSelect('SUM(poll.neu)', 'totalNeu')
      .addSelect('SUM(poll.pro) - SUM(poll.con)', 'score')
      .orderBy('poll.pollDate', 'DESC')
      .limit(40)
      .getRawMany();
    return issues;
  }

  //전체 이슈 조회
  //정치인별로 구별 필요하므로 정치인 서비스에서 매칭 작업해야함
  // 이슈에서는 정치인 그룹별로 모든 이슈 조회까지만
  async getAllActiveIssues() {
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
