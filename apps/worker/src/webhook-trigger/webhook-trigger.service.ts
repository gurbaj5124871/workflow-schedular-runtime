import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WebhookTriggerService {
  constructor(public readonly httpService: HttpService) {}

  async triggerWebhook(url: string): Promise<void> {
    await this.httpService.axiosRef.post(url);
  }
}
