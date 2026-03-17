import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsOptional()
  name?: string;

}