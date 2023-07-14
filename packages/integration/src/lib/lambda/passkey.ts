import { ic } from "@nfid/integration"

export async function storePasskey(key: string, data: string) {
  const passkeyURL = ic.isLocal ? `/passkey` : AWS_PASSKEY
  return await fetch(passkeyURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      data,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
  })
}

export async function getPasskey(keys: string[]) {
  const passkeyURL = ic.isLocal ? `/passkey` : AWS_PASSKEY
  const params = new URLSearchParams()
  keys.forEach((key) => {
    params.append("keys", key)
  })
  const queryString = params.toString()
  return await fetch(`${passkeyURL}?${queryString}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  })
}
