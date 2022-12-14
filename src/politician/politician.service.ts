import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Politician } from 'src/entities/politician.entity';
import { Repository } from 'typeorm';
import { AddPoliticianDto } from './dto/politician.add.politician.dto';
import { UpdatePoliticianDto } from './dto/politician.update.politician.dto';

@Injectable()
export class PoliticianService {
  constructor(
    @InjectRepository(Politician)
    private politicianRepository: Repository<Politician>,
  ) {}

  async create(politician: AddPoliticianDto): Promise<Politician> {
    return await this.politicianRepository.save(politician);
  }

  async getAllPoliticians(): Promise<Politician[]> {
    return await this.politicianRepository.find();
  }

  async getIssuesByPolitician(targetPolitician: number) {
    const result = await this.politicianRepository
      .createQueryBuilder('politician')
      .leftJoinAndSelect('politician.issues', 'issue')
      .leftJoinAndSelect('issue.polls', 'poll')
      .select([
        'politician.id',
        'issue.id',
        'issue.issueDate as date',
        'SUM(poll.pro) - SUM(poll.con) as score',
      ])
      .where('issue.isPollActive = :isPollActive', { isPollActive: true })
      .andWhere('issue.politician = :politician', {
        politician: targetPolitician,
      })
      .groupBy('issue.id')
      .orderBy({ 'poll.pollDate': 'DESC' })
      // .orderBy({ 'issue.issueDate': 'DESC', score: 'DESC' })
      .getRawMany();

    return result;
  }

  groupByPolitician(arr, prop) {
    return arr.reduce(function (acc, obj) {
      if (!acc[`${prop}_${obj[prop]}`]) {
        acc[`${prop}_${obj[prop]}`] = [];
      }
      acc[`${prop}_${obj[prop]}`].push(obj);
      return acc;
    }, {});
  }

  async getAllPollIssuesPerPolitician() {
    const result = await this.politicianRepository
      .createQueryBuilder('politician')
      .leftJoinAndSelect('politician.issues', 'issue')
      .leftJoinAndSelect('issue.polls', 'poll')
      .select([
        'politician.id',
        'issue.id',
        'issue.issueDate as date',
        'SUM(poll.pro) - SUM(poll.con) as score',
      ])
      .where('issue.isPollActive = :isPollActive', { isPollActive: true })
      .groupBy('issue.id')
      .orderBy({ 'poll.pollDate': 'DESC' })
      .getRawMany();
    const answer = this.groupByPolitician(result, 'politician_id');
    return answer;
  }

  async getOnePoliticianById(id: number): Promise<Politician> {
    return await this.politicianRepository.findOneBy({ id });
  }

  async getOnePoliticianByName(name: string): Promise<Politician[]> {
    return await this.politicianRepository.find({ where: { name: name } });
  }

  async update(id: number, politicianData: UpdatePoliticianDto) {
    const existedPolitician = await this.politicianRepository.findOneBy({ id });
    if (existedPolitician) {
      await this.politicianRepository
        .createQueryBuilder()
        .update(Politician)
        .set({ ...politicianData })
        .where('id = :id', { id })
        .execute();
      return await this.politicianRepository.findOneBy({ id });
    }
    throw new BadRequestException();
  }

  async remove(politicianId): Promise<any> {
    const existedPolitician = await this.politicianRepository.findOneBy({
      id: politicianId,
    });

    if (!existedPolitician) {
      throw new Error('could not find such a politician');
    }
    await this.politicianRepository.delete({ id: politicianId });
    return `successfully deleted politicianID ${politicianId}`;
  }
}
