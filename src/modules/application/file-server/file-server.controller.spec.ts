import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file-server.controller';
import { FileService } from './file-server.service';

describe('FileServerController', () => {
  let controller: FileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [FileService],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
