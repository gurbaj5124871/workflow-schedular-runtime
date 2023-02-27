import { Test, TestingModule } from '@nestjs/testing';
import { WebhookTriggerService } from './webhook-trigger.service';

describe('WebhookTriggerService', () => {
  let service: WebhookTriggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookTriggerService],
    }).compile();

    service = module.get<WebhookTriggerService>(WebhookTriggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
