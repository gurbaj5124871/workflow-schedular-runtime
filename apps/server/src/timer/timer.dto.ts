import { ApiProperty } from '@nestjs/swagger';
import * as Joiful from 'joiful';

export class SetWebhookTimerRequestBodyDTO {
  @ApiProperty()
  @Joiful.number().integer().min(0).default(0)
  hours: number;

  @ApiProperty()
  @Joiful.number().integer().min(0).max(59).default(0)
  minutes: number;

  @ApiProperty()
  @Joiful.number().integer().min(0).max(59).default(0)
  seconds: number;

  @ApiProperty()
  @Joiful.string().uri().required()
  url: string;
}

export class SetWebhookTimerResponseBodyDTO {
  @ApiProperty()
  id: string;
}

export class GetTimeLeftForWebhookTriggerInSecondsRequestParamsDTO {
  @ApiProperty()
  @Joiful.string().required().guid({
    version: 'uuidv4',
  })
  id: string;
}

export class GetTimeLeftForWebhookTriggerInSecondsResponseBodyDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  time_left: number;
}
