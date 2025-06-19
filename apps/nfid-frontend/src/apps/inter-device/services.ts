import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"

import { AuthorizationRequest } from "frontend/state/authorization"

export function getDataFromPath(): Promise<{
  authRequest: AuthorizationRequest
  pubsubChannel: string
}> {
  const params = Object.fromEntries(
    new URLSearchParams(window.location.search).entries(),
  )
  const { secret, maxTimeToLive, aliasDomain, derivationOrigin } = params

  console.debug(getDataFromPath.name, { ...params })

  const sessionPublicKey = new Uint8Array(fromHexString(secret))
  return Promise.resolve({
    authRequest: {
      hostname: aliasDomain,
      maxTimeToLive: BigInt(maxTimeToLive),
      sessionPublicKey,
      derivationOrigin,
    },
    pubsubChannel: secret,
  })
}
