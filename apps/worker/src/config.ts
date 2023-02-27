import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV,
  deployEnv: process.env.DEPLOY_ENV,
  port: process.env.PORT || 3001,

  temporalHostUrl: process.env.TEMPORAL_HOST_URL,
  temporalIsTlsEnabled: process.env.TEMPORAL_IS_TLS_ENABLED,
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE,
  temporalDebugMode: process.env.TEMPORAL_WORKER_DEBUG_MODE,
};

export type ConfigType = typeof config;

export default () => config;
