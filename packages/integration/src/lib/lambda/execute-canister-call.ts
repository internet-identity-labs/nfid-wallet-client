import { DelegationChain, DelegationIdentity } from "@dfinity/identity"

import { ONE_MINUTE_IN_MS } from "@nfid/config"
import { ic } from "@nfid/integration"

import { Chain, createDelegationChain, fetchLambdaPublicKey } from "./ecdsa"

export async function executeCanisterCall(
  identity: DelegationIdentity,
  calledMethodName: string,
  canisterId: string,
  parameters?: string,
): Promise<string> {
  const chain = Chain.IC

  const lambdaPublicKey = await fetchLambdaPublicKey(chain)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    calledMethodName,
    parameters,
    canisterId,
  }

  const executeURL = ic.isLocal ? `/execute_candid` : AWS_EXECUTE_CANDID

  const response = await fetch(executeURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })

  if (!response.result) {
    throw new Error(
      `Unable to execute method ${calledMethodName}: ` + response.error,
    )
  }

  return response.result
}
