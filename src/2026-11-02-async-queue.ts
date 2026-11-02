/**
 * AsyncQueue — process async tasks sequentially with optional concurrency limit.
 *
 * Useful for rate-limiting API calls, processing uploads, or any ordered
 * background work where you want to control parallelism.
 *
 * @example
 * const queue = new AsyncQueue(2); // max 2 concurrent
 * queue.add(() => fetch('/api/1'));
 * queue.add(() => fetch('/api/2'));
 * await queue.onIdle();
 */

export type Task<T = unknown> = () => Promise<T>;

export interface QueueResult<T = unknown> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
}

export class AsyncQueue {
  private readonly concurrency: number;
  private running = 0;
  private readonly queue: Array<{
    task: Task;
    resolve: (r: QueueResult) => void;
  }> = [];
  private idleResolvers: Array<() => void> = [];

  constructor(concurrency = 1) {
    if (concurrency < 1) throw new Error('concurrency must be >= 1');
    this.concurrency = concurrency;
  }

  /**
   * Enqueue a task. Returns a promise that settles when the task finishes
   * (fulfilled or rejected).
   */
  add<T>(task: Task<T>): Promise<QueueResult<T>> {
    return new Promise((resolve) => {
      this.queue.push({ task: task as Task, resolve: resolve as (r: QueueResult) => void });
      this.drain();
    });
  }

  /**
   * Resolves when the queue is empty and nothing is running.
   */
  onIdle(): Promise<void> {
    if (this.running === 0 && this.queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.idleResolvers.push(resolve);
    });
  }

  /** Number of tasks waiting */
  get pending(): number {
    return this.queue.length;
  }

  /** Number of tasks currently executing */
  get active(): number {
    return this.running;
  }

  private drain(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.running++;

      Promise.resolve()
        .then(() => item.task())
        .then(
          (value) => {
            item.resolve({ status: 'fulfilled', value });
          },
          (reason) => {
            item.resolve({ status: 'rejected', reason });
          },
        )
        .finally(() => {
          this.running--;
          this.drain();
          if (this.running === 0 && this.queue.length === 0) {
            this.idleResolvers.forEach((r) => r());
            this.idleResolvers = [];
          }
        });
    }
  }
}

// ---------- Usage Example ----------
const queue = new AsyncQueue(2);

async function demo() {
  const tasks = [1, 2, 3, 4, 5].map((n) =>
    queue.add(async () => {
      console.log(`start ${n}`);
      await new Promise((r) => setTimeout(r, 100));
      console.log(`done ${n}`);
      return n * 10;
    }),
  );

  const results = await Promise.all(tasks);
  console.log(results);
  // [ {status:'fulfilled', value:10}, ... ]

  await queue.onIdle();
  console.log('queue idle');
}

demo();
