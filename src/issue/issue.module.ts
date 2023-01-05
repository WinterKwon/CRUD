import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Politician } from 'src/entities/politician.entity';
import { Poll } from 'src/entities/poll.entity';
import { User } from 'src/entities/user.entity';
import { Vote } from 'src/entities/vote.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Poll, User, Politician, Vote])],
  controllers: [IssueController],
  providers: [IssueService],
})
export class IssueModule {}
