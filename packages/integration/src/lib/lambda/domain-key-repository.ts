export const domainKeyStorage = "domainKeyStorage"
export const defaultExpirationInMinutes = 120

export function saveToStorage(
  key: string,
  value: any,
  ttlInMinutes: number,
): void {
  const data = loadFromStorage()
  const expirationTimestamp = Date.now() + ttlInMinutes * 60 * 1000
  data[key] = { value, expirationTimestamp }
  saveDataToStorage(data)
}

export function getFromStorage(key: string): any {
  const data = loadFromStorage()
  const item = data[key]

  if (item) {
    if (item.expirationTimestamp >= Date.now()) {
      return item.value
    } else {
      delete data[key]
      saveDataToStorage(data)
      throw new Error(`Value for key '${key}' has expired.`)
    }
  } else {
    throw new Error(`Value for key '${key}' not found.`)
  }
}

export function isPresentInStorage(key: string) {
  const data = loadFromStorage()
  const item = data[key]

  if (item) {
    if (item.expirationTimestamp >= Date.now()) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export function deleteFromStorage(key: string): void {
  const data = loadFromStorage()
  if (data[key]) {
    delete data[key]
    saveDataToStorage(data)
  }
}

function loadFromStorage(): { [key: string]: any } {
  const storedData = localStorage.getItem(domainKeyStorage)
  return storedData ? JSON.parse(storedData) : {}
}

function saveDataToStorage(data: { [key: string]: any }): void {
  localStorage.setItem(domainKeyStorage, JSON.stringify(data))
}
