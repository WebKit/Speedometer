// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { TrackData } from './parsers';
import { UrlState } from './url-state';

export interface StorageDriver {
  openDB(): Promise<void>;
  save(track: TrackData): Promise<void>;
  getAll(): Promise<TrackData[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  set(key: string, value: any): Promise<void>;
  get<T = any>(key: string): Promise<T | null>;
}

class InMemoryStorage implements StorageDriver {
  private trackStore = new Map<string, TrackData>();
  private settingStore = new Map<string, any>();

  async openDB(): Promise<void> {
    return Promise.resolve();
  }

  async save(track: TrackData): Promise<void> {
    this.trackStore.set(track.id, track);
    return Promise.resolve();
  }

  async getAll(): Promise<TrackData[]> {
    return Promise.resolve(Array.from(this.trackStore.values()));
  }

  async remove(id: string): Promise<void> {
    this.trackStore.delete(id);
    return Promise.resolve();
  }

  async clear(): Promise<void> {
    this.trackStore.clear();
    this.settingStore.clear();
    return Promise.resolve();
  }

  async set(key: string, value: any): Promise<void> {
    this.settingStore.set(key, value);
    return Promise.resolve();
  }

  async get<T = any>(key: string): Promise<T | null> {
    return Promise.resolve((this.settingStore.get(key) as T) ?? null);
  }
}

class IndexedDBStorage implements StorageDriver {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'weg-gps-db';
  private readonly DB_VERSION = 2;

  async openDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('tracks'))
          db.createObjectStore('tracks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      };
      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  private getStore(name: 'tracks' | 'settings', mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('IndexedDB not opened');
    return this.db.transaction(name, mode).objectStore(name);
  }

  async save(track: TrackData): Promise<void> {
    return new Promise((res, rej) => {
      const req = this.getStore('tracks', 'readwrite').put(track);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }

  async getAll(): Promise<TrackData[]> {
    return new Promise((res, rej) => {
      const req = this.getStore('tracks', 'readonly').getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }

  async remove(id: string): Promise<void> {
    return new Promise((res, rej) => {
      const req = this.getStore('tracks', 'readwrite').delete(id);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return Promise.resolve();
    return new Promise((res, rej) => {
      const tx = this.db!.transaction(['tracks', 'settings'], 'readwrite');
      tx.objectStore('tracks').clear();
      tx.objectStore('settings').clear();
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async set(key: string, value: any): Promise<void> {
    return new Promise((res, rej) => {
      const req = this.getStore('settings', 'readwrite').put(value, key);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    return new Promise((res, rej) => {
      const req = this.getStore('settings', 'readonly').get(key);
      req.onsuccess = () => res((req.result as T) ?? null);
      req.onerror = () => rej(req.error);
    });
  }
}

let activeDriver: StorageDriver = new InMemoryStorage();

export const Storage: StorageDriver = {
  openDB: async (): Promise<void> => {
    const backend = UrlState.get().storage;
    activeDriver = backend === 'indexeddb' ? new IndexedDBStorage() : new InMemoryStorage();
    await activeDriver.openDB();
  },
  save: (t) => activeDriver.save(t),
  getAll: () => activeDriver.getAll(),
  remove: (id) => activeDriver.remove(id),
  clear: () => activeDriver.clear(),
  set: (k, v) => activeDriver.set(k, v),
  get: <T>(k: string) => activeDriver.get<T>(k),
};
