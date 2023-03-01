export const testConfig = {
  temporalTaskQueue: 'test',
};

export function mockConfigService() {
  return {
    get: (key: string): string => testConfig[key],
  };
}
