import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebhookTriggerService } from './webhook-trigger.service';

@Module({
  imports: [HttpModule],
  providers: [WebhookTriggerService],
  exports: [WebhookTriggerService],
})
export class WebhookTriggerModule {}
