import * as Joiful from 'joiful';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum DeployEnvironment {
  Local = 'local',
  Develop = 'develop',
  Staging = 'staging',
  Prod = 'production',
}

class EnvironmentVariables {
  @Joiful.string()
    .valid(Object.values(Environment))
    .default(Environment.Development)
  NODE_ENV?: Environment;

  @Joiful.string()
    .valid(Object.values(DeployEnvironment))
    .default(DeployEnvironment.Local)
  DEPLOY_ENV?: DeployEnvironment;

  @Joiful.number().integer().positive().default(3000)
  PORT = 3000;

  @Joiful.string().required()
  TEMPORAL_HOST_URL: string;

  @Joiful.boolean()
  TEMPORAL_IS_TLS_ENABLED: boolean;

  @Joiful.string().required()
  TEMPORAL_TASK_QUEUE: string;

  @Joiful.boolean().default(false)
  TEMPORAL_WORKER_DEBUG_MODE: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validationResult = Joiful.validateAsClass(
    config,
    EnvironmentVariables,
    { stripUnknown: true },
  );

  if (validationResult.error) {
    throw new Error(validationResult.error as any);
  }
  return validationResult.value;
}
