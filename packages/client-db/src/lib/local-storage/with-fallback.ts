export class LocalStorageWithFallback {
  private hasLocalStorage: boolean
  private _data: Map<string, string> | undefined

  constructor() {
    try {
      // Attempt to access localStorage to check if it's available.
      window.localStorage.setItem("__test__", "__test__")
      window.localStorage.removeItem("__test__")
      this.hasLocalStorage = true
    } catch (e) {
      // If accessing localStorage throws an error, it's likely incognito mode.
      this.hasLocalStorage = false
    }
  }

  get data(): Map<string, string> {
    if (!this._data) {
      this._data = new Map<string, string>()
    }
    return this._data
  }

  setItem(key: string, value: string): void {
    if (this.hasLocalStorage) {
      window.localStorage.setItem(key, value)
    } else {
      this.data.set(key, value)
    }
  }

  getItem(key: string): string | null {
    if (this.hasLocalStorage) {
      return window.localStorage.getItem(key)
    } else {
      return this.data.get(key) || null
    }
  }

  removeItem(key: string): void {
    if (this.hasLocalStorage) {
      window.localStorage.removeItem(key)
    } else {
      this.data.delete(key)
    }
  }

  clear(): void {
    if (this.hasLocalStorage) {
      window.localStorage.clear()
    } else {
      this.data.clear()
    }
  }

  // Other methods can be implemented similarly.

  get length(): number {
    if (this.hasLocalStorage) {
      return window.localStorage.length
    } else {
      return this.data.size
    }
  }

  key(index: number): string | null {
    if (this.hasLocalStorage) {
      return window.localStorage.key(index)
    } else {
      const keys = Array.from(this.data.keys())
      return index >= 0 && index < keys.length ? keys[index] : null
    }
  }
}

export const localStorageWithFallback = new LocalStorageWithFallback()
