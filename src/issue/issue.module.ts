import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Poll } from 'src/entities/poll.entity';
import { PollResult } from 'src/entities/pollResult.entitiy';
import { Register } from 'src/entities/register.entity';
import { RegisterProCon } from 'src/entities/registerProCon.entity';
import { User } from 'src/entities/user.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Issue,
      Register,
      Poll,
      PollResult,
      RegisterProCon,
      User,
    ]),
  ],
  controllers: [IssueController],
  providers: [IssueService],
})
export class IssueModule {}
