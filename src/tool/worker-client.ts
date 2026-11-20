import type { WorkerErrorCode, WorkerRequest, WorkerResponse } from './protocol';

type Progress = (phase: 'reading' | 'parsing' | 'building', fraction: number) => void;

export class WorkerError extends Error {
  constructor(
    public readonly code: WorkerErrorCode,
    public readonly detail?: string,
  ) {
    super(code);
  }
}

/** Petite surcouche à base de promesses autour du Web Worker de lecture. */
export class CsvWorker {
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<
    number,
    {
      resolve: (v: unknown) => void;
      reject: (e: unknown) => void;
      onProgress?: Progress | undefined;
    }
  >();

  constructor() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const p = this.pending.get(msg.id);
      if (!p) return;
      if (msg.type === 'progress') {
        p.onProgress?.(msg.phase, msg.fraction);
      } else if (msg.type === 'result') {
        this.pending.delete(msg.id);
        p.resolve(msg.data);
      } else {
        this.pending.delete(msg.id);
        p.reject(new WorkerError(msg.code, msg.detail));
      }
    };
    this.worker.onerror = (e) => {
      for (const p of this.pending.values()) p.reject(new WorkerError('unexpected', e.message));
      this.pending.clear();
    };
  }

  request<T>(req: DistributiveOmit<WorkerRequest, 'id'>, onProgress?: Progress): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress });
      this.worker.postMessage({ ...req, id } as WorkerRequest);
    });
  }
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
