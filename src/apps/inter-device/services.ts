import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"

import { AuthorizationRequest } from "frontend/state/authorization"

/**
 * parses remote idp pathname into AuthRequest
 * https://domain.com/ridp/?secret=0047b1e4-9930-4bb3-bb48-ce61a4aefc92&scope=&derivationOrigin=&maxTimeToLive=606458947591554&applicationName=NFID-Demo&applicationLogo=https%253A%252F%252Flogo.clearbit.com%252Fclearbit.com
 */
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
