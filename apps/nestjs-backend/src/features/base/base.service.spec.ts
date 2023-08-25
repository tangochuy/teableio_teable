import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BaseModule } from './base.module';
import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BaseModule],
    }).compile();

    service = module.get<BaseService>(BaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
