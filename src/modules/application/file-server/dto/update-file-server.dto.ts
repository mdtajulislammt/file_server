import { PartialType } from '@nestjs/swagger';
import { CreateFileDto } from './create-file-server.dto';

export class UpdateFileServerDto extends PartialType(CreateFileDto) {}
