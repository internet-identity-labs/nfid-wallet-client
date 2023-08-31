export const domainKeyStorage = "domainKeyStorage";

export function saveToStorage(key: string, value: any, ttlInMinutes: number): void {
  const data = loadFromStorage();
  const expirationTimestamp = Date.now() + ttlInMinutes * 60 * 1000;
  data[key] = { value, expirationTimestamp };
  saveDataToStorage(data);
}

export function getFromStorage(key: string): any {
  const data = loadFromStorage();
  const item = data[key];

  if (item) {
    if (item.expirationTimestamp >= Date.now()) {
      return item.value;
    } else {
      delete data[key];
      saveDataToStorage(data);
      throw new Error(`Value for key '${key}' has expired.`);
    }
  } else {
    throw new Error(`Value for key '${key}' not found.`);
  }
}

function loadFromStorage(): { [key: string]: any } {
  const storedData = localStorage.getItem(domainKeyStorage);
  return storedData ? JSON.parse(storedData) : {};
}

function saveDataToStorage(data: { [key: string]: any }): void {
  localStorage.setItem(domainKeyStorage, JSON.stringify(data));
}
