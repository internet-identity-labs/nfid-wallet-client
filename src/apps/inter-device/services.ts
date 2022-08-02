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
  const [_, _path, secret, maxTimeToLive, aliasDomain, derivationOrigin] =
    window.location.pathname.split("/")
  const sessionPublicKey = new Uint8Array(fromHexString(secret))
  console.debug("getDataFromPath", {
    _path,
    secret,
    maxTimeToLive,
    aliasDomain,
    derivationOrigin,
    sessionPublicKey,
  })
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
