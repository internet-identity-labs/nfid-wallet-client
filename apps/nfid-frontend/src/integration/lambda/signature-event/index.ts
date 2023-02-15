import { BasicSignatureEvent } from "src/integration/lambda/signature-event/basic-event"

import { ic } from "@nfid/integration"

declare const AWS_SIGNATURE_EVENT: string

export async function storeSignatureEvent(event: BasicSignatureEvent) {
  console.log(AWS_SIGNATURE_EVENT)
  const url = ic.isLocal ? "/signature" : AWS_SIGNATURE_EVENT
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  })

  if (!response.ok) throw new Error(await response.text())
  return response
}
