import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CalculationModule } from './calculation.module';
import { FieldCalculationService } from './field-calculation.service';

describe('FieldCalculationService', () => {
  let service: FieldCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CalculationModule],
    }).compile();

    service = module.get<FieldCalculationService>(FieldCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
