import { Module } from '@nestjs/common';
import { TemporalWorkerConnectionProvider } from '../temporal-worker-connection.provider';
import { WorkflowService } from './workflow.service';
import { WebhookTriggerModule } from '../webhook-trigger/webhook-trigger.module';

@Module({
  imports: [WebhookTriggerModule],
  providers: [TemporalWorkerConnectionProvider, WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
