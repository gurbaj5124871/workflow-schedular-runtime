import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigType } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService: ConfigService<ConfigType> = app.get(ConfigService);

  if (configService.get('enableApiDocs')) {
    const config = new DocumentBuilder()
      .setTitle('Webhook trigger timer service')
      .setDescription('Service that handles and schedules webhook triggers')
      .addTag('timer')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  app.enableShutdownHooks();
  await app.listen(configService.get('port'));

  const logger = new Logger(`server-bootstrap`);

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
