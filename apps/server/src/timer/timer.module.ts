import { Module } from '@nestjs/common';
import { TemporalClientConnectionProvider } from '../temporal-client-connection.provider';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';

@Module({
  providers: [TemporalClientConnectionProvider, TimerService],
  controllers: [TimerController],
})
export class TimerModule {}
