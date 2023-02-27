import { FactoryProvider } from '@nestjs/common';
import { Connection, ConnectionOptions } from '@temporalio/client';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config';

export const TemporalClientConnectionProvider: FactoryProvider = {
  provide: 'TEMPORAL_CLIENT_CONNECTION',
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<ConfigType>,
  ): Promise<Connection> => {
    const temporalClientConfig: ConnectionOptions = {
      address: configService.get('temporalHostUrl', { infer: true }),
    };
    if (configService.get('temporalIsTlsEnabled') == true) {
      temporalClientConfig.tls = true;
    }

    return Connection.connect(temporalClientConfig);
  },
};
