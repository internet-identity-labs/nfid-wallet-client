import { domainKeyStorage } from "./domain-key-storage"

export const DOMAIN_KEY_STORAGE_KEY = "data"
export const DEFAULT_EXPIRAITON_TIME_MILLIS = 120 * 60 * 1000

export async function saveToStorage(
  key: string,
  value: any,
  ttlMillis: number,
): Promise<void> {
  await domainKeyStorage.set(key, value, ttlMillis)
}

export async function getFromStorage(key: string): Promise<any> {
  const item = await domainKeyStorage.getEvenExpired(key)

  if (!item) throw new Error(`Value for key '${key}' not found.`)

  if (item.expired) {
    await domainKeyStorage.remove(key)
    throw new Error(`Value for key '${key}' has expired.`)
  }

  return item.value
}

export async function isPresentInStorage(key: string) {
  const item = await domainKeyStorage.getEvenExpired(key)
  return !!item && !item.expired
}

export async function deleteFromStorage(key: string): Promise<void> {
  await domainKeyStorage.remove(key)
}
