import { Test, TestingModule } from '@nestjs/testing';
import { FileServerService } from './file-server.service';

describe('FileServerService', () => {
  let service: FileServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileServerService],
    }).compile();

    service = module.get<FileServerService>(FileServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
