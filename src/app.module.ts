import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PoliticianModule } from './politician/politician.module';
import { Politician } from './entities/politician.entity';
import { IssueModule } from './issue/issue.module';
import { Issue } from './entities/issue.entity';
import { Poll } from './entities/poll.entity';
import { Vote } from './entities/vote.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : 'env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Politician, Issue, Poll, Vote],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    AuthModule,
    PoliticianModule,
    IssueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
