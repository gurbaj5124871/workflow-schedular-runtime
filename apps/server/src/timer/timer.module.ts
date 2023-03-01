import { Module } from '@nestjs/common';
import { TemporalClientProvider } from '../temporal-client.provider';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';

@Module({
  providers: [TemporalClientProvider, TimerService],
  controllers: [TimerController],
})
export class TimerModule {}
