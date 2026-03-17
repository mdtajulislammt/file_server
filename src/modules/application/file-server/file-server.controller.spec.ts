import { Test, TestingModule } from '@nestjs/testing';
import { FileServerController } from './file-server.controller';
import { FileServerService } from './file-server.service';

describe('FileServerController', () => {
  let controller: FileServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileServerController],
      providers: [FileServerService],
    }).compile();

    controller = module.get<FileServerController>(FileServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
