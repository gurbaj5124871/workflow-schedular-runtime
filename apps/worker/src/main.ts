import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WorkerModule } from './worker.module';
import { ConfigType } from './config';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService: ConfigService<ConfigType> = app.get(ConfigService);

  app.enableShutdownHooks();
  await app.listen(configService.get('port'));

  const logger = new Logger(`worker-bootstrap`);

  process.on('unhandledRejection', (err) => {
    logger.error({
      err,
    });
  });
  process.on('uncaughtException', (err) => {
    logger.error({
      err,
    });
  });
}

bootstrap();
