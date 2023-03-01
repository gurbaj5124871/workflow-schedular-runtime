import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';

@Injectable()
export class TimerService {
  private readonly logger: Logger = new Logger(TimerService.name);

  constructor(
    @Inject('TEMPORAL_CLIENT')
    private readonly temporalClient: Client,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  getDeadlineInMsFromCurrentTime(timer: {
    hours: number;
    minutes: number;
    seconds: number;
  }): number {
    const { hours, minutes, seconds } = timer;
    return Date.now() + hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  async setWebhookTimer(
    url: string,
    deadlineTimestampMs: number,
  ): Promise<string> {
    const id = uuid();
    const webhookURL = `${url}/${id}`;

    await this.temporalClient.workflow.start('triggerWebhookWorkflow', {
      taskQueue: this.configService.get('temporalTaskQueue'),
      workflowId: id,
      args: [
        {
          url: webhookURL,
          deadlineTimestampMs,
        },
      ],
    });

    return id;
  }

  async getTimeLeftForWebhookTriggerInSeconds(id: string): Promise<number> {
    const now = new Date().getTime();

    const handle = this.temporalClient.workflow.getHandle(id);
    const deadline: number = await handle.query('getDeadline');

    if (deadline - now < 0) {
      return 0;
    }

    return Math.ceil((deadline - now) / 1000);
  }

  async onModuleDestroy() {
    await new Promise((res) => {
      setTimeout(async () => {
        await this.temporalClient.connection.close();
        this.logger.log(`Temporal client disconnected`);
        res(null);
      }, 3000);
    });
  }
}
