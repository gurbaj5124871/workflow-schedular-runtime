import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV,
  deployEnv: process.env.DEPLOY_ENV,
  port: process.env.PORT || 3000,
  enableApiDocs: process.env.ENABLE_API_DOCS === 'true',

  temporalHostUrl: process.env.TEMPORAL_HOST_URL,
  temporalIsTlsEnabled: process.env.TEMPORAL_IS_TLS_ENABLED,
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE,
};

export type ConfigType = typeof config;

export default () => config;
