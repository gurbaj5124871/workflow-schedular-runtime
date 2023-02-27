import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker, NativeConnection } from '@temporalio/worker';
import * as ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';
import { WebhookTriggerService } from '../webhook-trigger/webhook-trigger.service';

@Injectable()
export class WorkflowService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(WorkflowService.name);
  private temporalWorker: Worker;

  constructor(
    @Inject('TEMPORAL_WORKER_CONNECTION')
    private readonly temporalWorkerConnection: NativeConnection,
    private readonly configService: ConfigService<ConfigType>,
    private readonly webhookTriggerService: WebhookTriggerService,
  ) {}

  async onModuleInit() {
    const activities = {
      triggerWebhook: this.webhookTriggerService.triggerWebhook.bind(
        this.webhookTriggerService,
      ),
    };
    const taskQueue = this.configService.get('temporalTaskQueue', {
      infer: true,
    });
    this.temporalWorker = await Worker.create({
      connection: this.temporalWorkerConnection,
      workflowsPath: require.resolve('./workflow'),
      taskQueue,
      activities,

      shutdownGraceTime: ms('5 seconds'),
      maxConcurrentActivityTaskExecutions: 100,
      maxConcurrentWorkflowTaskExecutions: 100,
      stickyQueueScheduleToStartTimeout: ms('3s'),

      debugMode: this.configService.get('temporalDebugMode'),
    });

    await this.temporalWorker.run();
    this.logger.log(`Temporal worker running`);
  }

  async onModuleDestroy() {
    await this.temporalWorker.shutdown();
    this.logger.log(`Temporal worker stopped`);
  }
}
