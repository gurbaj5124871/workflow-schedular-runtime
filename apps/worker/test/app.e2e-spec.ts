import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { WorkerModule } from './../src/worker.module';

describe('WorkerController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WorkerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
