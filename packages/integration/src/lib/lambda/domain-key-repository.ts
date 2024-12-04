import { domainKeyStorage } from "./domain-key-storage"

export const DOMAIN_KEY_STORAGE_KEY = "data"
export const defaultExpirationInMinutes = 120

export async function saveToStorage(
  key: string,
  value: any,
  ttlInMinutes: number,
): Promise<void> {
  await domainKeyStorage.set(key, value, ttlInMinutes)
}

export async function getFromStorage(key: string): Promise<any> {
  const item = await domainKeyStorage.getEvenExpired(key)

  if (item) {
    if (!item.expired) {
      return item.value
    } else {
      await domainKeyStorage.remove(key)
      throw new Error(`Value for key '${key}' has expired.`)
    }
  } else {
    throw new Error(`Value for key '${key}' not found.`)
  }
}

export async function isPresentInStorage(key: string) {
  const item = await domainKeyStorage.getEvenExpired(key)

  if (item) {
    if (!item.expired) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export async function deleteFromStorage(key: string): Promise<void> {
  await domainKeyStorage.remove(key)
}
