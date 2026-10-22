export interface SyncJob<T> {
  identity: string;
  revision: number;
  value: T;
}

interface SerialSyncQueueOptions<T, TResult> {
  execute: (job: SyncJob<T>) => Promise<TResult>;
  isCurrent: (job: SyncJob<T>) => boolean;
  onSuccess: (result: TResult, job: SyncJob<T>) => void;
  onError: (error: unknown, job: SyncJob<T>) => void;
}

export class SerialSyncQueue<T, TResult> {
  private pending: SyncJob<T> | null = null;
  private running = false;
  private waiters: Array<() => void> = [];
  private readonly options: SerialSyncQueueOptions<T, TResult>;

  constructor(options: SerialSyncQueueOptions<T, TResult>) {
    this.options = options;
  }

  request(job: SyncJob<T>) {
    this.pending = job;
    void this.drain();
  }

  retry() {
    void this.drain();
  }

  hasPending() {
    return this.pending !== null;
  }

  whenIdle() {
    if (!this.running) return Promise.resolve();
    return new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  private settleWaiters() {
    const waiters = this.waiters.splice(0);
    waiters.forEach((resolve) => resolve());
  }

  private peekPending() {
    return this.pending;
  }

  private async drain() {
    if (this.running || !this.pending) return;
    this.running = true;

    try {
      while (this.pending) {
        const job: SyncJob<T> = this.pending;
        this.pending = null;
        try {
          const result = await this.options.execute(job);
          if (this.options.isCurrent(job)) {
            this.options.onSuccess(result, job);
          }
        } catch (error) {
          const newerJob = this.peekPending();
          if (newerJob) continue;

          this.pending = job;
          if (this.options.isCurrent(job)) {
            this.options.onError(error, job);
          }
          break;
        }
      }
    } finally {
      this.running = false;
      this.settleWaiters();
    }
  }
}
