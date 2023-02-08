import { ic } from "@nfid/integration"

declare const AWS_AUTH_STATS: string

export async function storeSignIn(event: {
  principal: string
  blockchainAddress: string
  chain: string
  application: string
  billable: boolean
}) {
  const url = ic.isLocal ? "/auth" : AWS_AUTH_STATS
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  })

  if (!response.ok) throw new Error(await response.text())
}
