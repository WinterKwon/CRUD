import {
  Controller,
  Get,
  HttpStatus,
  Res,
  Patch,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { Body, Param, Post, Req } from '@nestjs/common/decorators';

import { Politician } from 'src/entities/politician.entity';
import { AddPoliticianDto } from './dto/politician.add.politician.dto';
import { UpdatePoliticianDto } from './dto/politician.update.politician.dto';
import { PoliticianService } from './politician.service';

@Controller('politicians')
@UseFilters()
export class PoliticianController {
  constructor(private politicianService: PoliticianService) {}

  // 정치인 전체 페이지 그래프용 이슈 조회 - 정치인별 그래프에 등록된 이슈
  @Get()
  async getAllPollIssuesPerPolitician(@Res() response): Promise<Array<any>> {
    try {
      const result =
        await this.politicianService.getAllPollIssuesPerPolitician();
      return response.status(HttpStatus.OK).json(result);
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json(err.message);
    }
  }

  @Get('all')
  async getAllPoliticians(@Res() response): Promise<Politician[]> {
    try {
      const politicians = await this.politicianService.getAllPoliticians();
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        politicians,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json(err.message);
    }
  }

  @Get(':id')
  async getOnePoliticianById(@Res() response, @Param('id') id: string) {
    try {
      const politician = await this.politicianService.getOnePoliticianById(+id);
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        politician,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json(err.message);
    }
  }

  // 동명이인 가능하므로 배열로 반환
  @Get(':name')
  async getOnePoliticianByName(@Res() response, @Param('name') name: string) {
    try {
      const politician = await this.politicianService.getOnePoliticianByName(
        name,
      );
      return response.status(HttpStatus.OK).json({
        message: 'found successfully',
        politician,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json(err.message);
    }
  }

  @Post()
  async create(@Body() politicianData: AddPoliticianDto, @Res() response) {
    try {
      const newPolitician = await this.politicianService.create(politicianData);
      return response.status(HttpStatus.OK).json({
        message: 'created politician successfully',
        newPolitician,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        messasge: 'failed to create new politician',
      });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() politicianData: UpdatePoliticianDto,
    @Res() response,
  ) {
    try {
      const updatedPolitician = await this.politicianService.update(
        +id,
        politicianData,
      );
      return response.status(HttpStatus.OK).json({
        message: 'updated politician successfully',
        updatedPolitician,
      });
    } catch (err) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'failed to update politician data',
        err,
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') politicianId: number, @Res() response) {
    try {
      const result = await this.politicianService.remove(politicianId);
      return response.status(HttpStatus.OK).json({ message: result });
    } catch (err) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: err.message });
    }
  }
}
