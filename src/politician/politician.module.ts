import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Politician } from 'src/entities/politician.entity';
import { PoliticianController } from './politician.controller';
import { PoliticianService } from './politician.service';

@Module({
  imports: [TypeOrmModule.forFeature([Politician])],
  exports: [TypeOrmModule],
  controllers: [PoliticianController],
  providers: [PoliticianService],
})
export class PoliticianModule {}
