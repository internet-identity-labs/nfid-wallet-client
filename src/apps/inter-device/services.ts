import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"

import { AuthorizationRequest } from "frontend/state/authorization"

/**
 * parses remote idp pathname into AuthRequest
 * https://domain.com/ridp/99a3070c-0e60-4315-b310-975193cfe0e2/606458659197117/http://localhost:3000?applicationName=NFID-Demo&applicationLogo=https%253A%252F%252Flogo.clearbit.com%252Fclearbit.com
 *
 */
export function getAuthRequestFromPath(): Promise<AuthorizationRequest> {
  const [_, _path, secret, maxTimeToLive, aliasDomain, derivationOrigin] =
    window.location.pathname.split("/")
  const sessionPublicKey = new Uint8Array(fromHexString(secret))
  console.debug(getAuthRequestFromPath.name, {
    _path,
    secret,
    maxTimeToLive,
    aliasDomain,
    derivationOrigin,
    sessionPublicKey,
  })
  return Promise.resolve({
    hostname: aliasDomain,
    maxTimeToLive: BigInt(maxTimeToLive),
    sessionPublicKey,
    derivationOrigin,
  })
}
