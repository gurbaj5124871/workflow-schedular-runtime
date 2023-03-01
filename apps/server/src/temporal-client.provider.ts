import { FactoryProvider } from '@nestjs/common';
import { Connection, ConnectionOptions, Client } from '@temporalio/client';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config';

export const TemporalClientProvider: FactoryProvider = {
  provide: 'TEMPORAL_CLIENT',
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<ConfigType>,
  ): Promise<Client> => {
    const temporalClientConfig: ConnectionOptions = {
      address: configService.get('temporalHostUrl', { infer: true }),
    };
    if (configService.get('temporalIsTlsEnabled') == true) {
      temporalClientConfig.tls = true;
    }

    const connection = await Connection.connect(temporalClientConfig);
    return new Client({
      connection,
    });
  },
};
