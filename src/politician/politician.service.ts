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

  // async getPoliCountByIssue(id:number): Promise<
}
