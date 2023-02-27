import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UsePipes,
  Logger,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { WorkflowNotFoundError } from '@temporalio/client';
import { ValidationPipe } from '../validation.pipe';
import {
  SetWebhookTimerRequestBodyDTO,
  SetWebhookTimerResponseBodyDTO,
  GetTimeLeftForWebhookTriggerInSecondsRequestParamsDTO,
  GetTimeLeftForWebhookTriggerInSecondsResponseBodyDTO,
} from './timer.dto';
import { TimerService } from './timer.service';

@ApiTags('timers')
@Controller('timers')
export class TimerController {
  private readonly logger: Logger = new Logger(TimerController.name);
  constructor(private readonly timerService: TimerService) {}

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Returns id of the newly scheduled webhook trigger task/job',
    type: SetWebhookTimerResponseBodyDTO,
  })
  @Post('')
  async setWebhookTimer(@Body() body: SetWebhookTimerRequestBodyDTO) {
    const { hours, minutes, seconds, url } = body;

    const deadlineTimestampMs =
      this.timerService.getDeadlineInMsFromCurrentTime({
        hours,
        minutes,
        seconds,
      });
    const webhookTriggerJobID = await this.timerService.setWebhookTimer(
      url,
      deadlineTimestampMs,
    );

    return {
      id: webhookTriggerJobID,
    };
  }

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Returns time left in seconds before webhook triggers',
    type: GetTimeLeftForWebhookTriggerInSecondsResponseBodyDTO,
  })
  @Get(':id')
  async getTimeLeftForWebhookTrigger(
    @Param() params: GetTimeLeftForWebhookTriggerInSecondsRequestParamsDTO,
  ) {
    try {
      const { id } = params;

      const timeLeftInSec =
        await this.timerService.getTimeLeftForWebhookTriggerInSeconds(id);

      return {
        id,
        time_left: timeLeftInSec,
      };
    } catch (err) {
      if (err instanceof WorkflowNotFoundError) {
        throw new NotFoundException(
          { message: 'Timer not found', statusCode: 404 },
          'Timer not found',
        );
      }
      throw err;
    }
  }
}
