interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

const KEY = "data";

class Store {
  storage: Storage;
  data: Record<string, unknown> = {};

  constructor(storage: Storage) {
    this.storage = storage;
    this.data = JSON.parse(this.storage.getItem(KEY) || "");
  }
  public setData(data: Record<string, any>) {
    this.storage.setItem(KEY, JSON.stringify(data));
    this.data = data;
  }

  public getData<T extends Record<string, any>>(): T {
    return this.data as T;
  }

  public get(key: string) {
    return this.data[key];
  }

  public set(key: string, value: unknown) {
    this.data[key] = value;
    this.setData(this.data);
  }

  public remove(key: string) {
    delete this.data[key];
    this.setData(this.data);
  }

  public clear() {
    this.data = {};
    this.setData(this.data);
  }
}

export const store = new Store(localStorage);
