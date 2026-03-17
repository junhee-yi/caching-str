type BrowserStorageValue = string | null;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const browserStorage = {
  get(key: string): BrowserStorageValue {
    return getStorage()?.getItem(key) ?? null;
  },

  set(key: string, value: string) {
    getStorage()?.setItem(key, value);
  },

  remove(key: string) {
    getStorage()?.removeItem(key);
  },

  clear() {
    getStorage()?.clear();
  },

  getJSON<T>(key: string): T | undefined {
    const value = this.get(key);
    return value ? (JSON.parse(value) as T) : undefined;
  },

  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
};
