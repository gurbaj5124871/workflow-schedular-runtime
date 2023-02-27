import {
  proxyActivities,
  defineQuery,
  defineSignal,
  setHandler,
} from '@temporalio/workflow';
import * as ms from 'ms';
import { UpdatableTimer } from './workflow.timer';
import type { WebhookTriggerService } from '../webhook-trigger/webhook-trigger.service';

const { triggerWebhook } = proxyActivities<WebhookTriggerService>({
  startToCloseTimeout: '1 minute', // Maximum time of a single Activity execution attempt
  scheduleToCloseTimeout: ms('5 minutes') + ms('10 seconds'), //Total time that a workflow is willing to wait for Activity to complete
  retry: {
    initialInterval: 1, // first retry waiting period
    backoffCoefficient: 2, // dictates how much the retry interval increases
    maximumAttempts: 5, // total number of attempts including 1st execution
  },
});

export const getDeadlineQuery = defineQuery<number>('getDeadline');
interface SetDeadlineSignalPayload {
  newDeadline: number;
}
export const setDeadlineSignal =
  defineSignal<[SetDeadlineSignalPayload]>('setDeadline');

export async function triggerWebhookWorkflow(args: {
  url: string;
  deadlineTimestampMs: number;
}): Promise<void> {
  const { url, deadlineTimestampMs } = args;

  const timer = new UpdatableTimer(deadlineTimestampMs);

  setHandler(
    setDeadlineSignal,
    ({ newDeadline }) => void (timer.deadline = newDeadline),
  ); // send in new deadlines via Signal
  setHandler(getDeadlineQuery, () => timer.deadline); // get the deadline time via Query

  // Delay the workflow for the scheduled time
  await timer;

  // Trigger the webhook after the sleep
  await triggerWebhook(url);
}
