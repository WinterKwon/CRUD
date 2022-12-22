import { PartialType } from '@nestjs/mapped-types';
import { AddPoliticianDto } from './politician.add.politician.dto';

export class UpdatePoliticianDto extends PartialType(AddPoliticianDto) {}
