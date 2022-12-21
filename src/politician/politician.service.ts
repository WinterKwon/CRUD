import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Politician } from 'src/entities/politician.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PoliticianService {
  constructor(
    @InjectRepository(Politician)
    private politicianRepository: Repository<Politician>,
  ) {}

  async create(politician: Politician): Promise<Politician> {
    return await this.politicianRepository.save(politician);
  }

  async getAllPoliticians(): Promise<Politician[]> {
    return await this.politicianRepository.find();
  }

  async getOnePoliticianById(id: number): Promise<Politician> {
    return await this.politicianRepository.findOneBy({ id });
  }

  // async getPoliCountByIssue(id:number): Promise<

}
