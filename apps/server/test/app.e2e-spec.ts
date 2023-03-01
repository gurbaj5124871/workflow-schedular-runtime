import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { WorkflowCoverage } from '@temporalio/nyc-test-coverage';
import { ConfigService } from '@nestjs/config';
import { TemporalClientProvider } from '../src/temporal-client.provider';
import { AppModule } from '../src/app.module';
import { mockConfigService } from './test-config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testEnv: TestWorkflowEnvironment;
  const workflowCoverage = new WorkflowCoverage();

  let configService: ReturnType<typeof mockConfigService>;

  beforeEach(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
    configService = mockConfigService();

    const { client } = testEnv;
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ConfigService, Logger, TemporalClientProvider],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider('TEMPORAL_CLIENT')
      .useFactory({
        factory: async () => client,
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await testEnv?.teardown();
    await app?.close();
  });

  describe('POST /timers', () => {
    it('creates a new timer request with returning id', async () => {
      const { client, nativeConnection } = testEnv;
      const worker = await Worker.create(
        workflowCoverage.augmentWorkerOptions({
          connection: nativeConnection,
          taskQueue: 'test',
          workflowsPath: require.resolve('../../worker/src/workflow/workflow'),
          activities: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            triggerWebhook: async (url: string) => Promise<void>,
          },
        }),
      );

      await worker.runUntil(async () => {
        const now = new Date().getTime();
        const response = await request(app.getHttpServer())
          .post(`/timers`)
          .send({
            hours: 0,
            minutes: 0,
            seconds: 10,
            url: 'https://webhook.site/95aea2c5-3c5f-4bc7-8ab9-e716dd5aa0cf',
          })
          .expect((response) => {
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toBeDefined();
            expect(response.body.id).toBeDefined();
          });

        const { id } = response.body;
        const handle = await client.workflow.getHandle(id);
        expect(handle).toBeDefined();

        const details = await handle.describe();
        expect(details).toBeDefined();
        expect(details.workflowId).toBe(id);

        const deadline: number = await handle.query('getDeadline');
        const timeout = Math.floor((deadline - now) / 1000);
        expect(timeout).toBe(10);
      });
    });
  });
});
