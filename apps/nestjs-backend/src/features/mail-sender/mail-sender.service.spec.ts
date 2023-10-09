import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GlobalModule } from '../../global/global.module';
import { MailSenderModule } from './mail-sender.module';
import { MailSenderService } from './mail-sender.service';

describe('MailSenderService', () => {
  let service: MailSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalModule, MailSenderModule],
    }).compile();

    service = module.get<MailSenderService>(MailSenderService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });
});
