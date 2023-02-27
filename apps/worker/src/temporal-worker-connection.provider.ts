import { FactoryProvider } from '@nestjs/common';
import { NativeConnection, NativeConnectionOptions } from '@temporalio/worker';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config';

export const TemporalWorkerConnectionProvider: FactoryProvider = {
  provide: 'TEMPORAL_CLIENT_CONNECTION',
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService<ConfigType>,
  ): Promise<NativeConnection> => {
    const temporalConfig: NativeConnectionOptions = {
      address: configService.get('temporalHostUrl'),
    };
    if (configService.get('temporalIsTlsEnabled') == true) {
      temporalConfig.tls = true;
    }

    return NativeConnection.connect(temporalConfig);
  },
};
