import NodeCache from 'node-cache';

type StoredValue = unknown;

export interface CacheStore {
  get(key: string): StoredValue;
  set(key: string, value: StoredValue): void;
  del(key: string): void;
}

export class NodeCacheAdapter implements CacheStore {
  private nodeCache: NodeCache | null = null;

  constructor({ nodeCache }: {
    nodeCache: NodeCache
  }) {
    this.nodeCache = nodeCache;
  }

  get(key: string): StoredValue {
    return this.nodeCache?.get(key);
  }

  set(key: string, value: StoredValue): void {
    this.nodeCache?.set(key, value);
  }

  del(key: string): void {
    this.nodeCache?.del(key);
  }
}
