import { WebAuthnIdentity } from "@dfinity/identity"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { getProofOfWork } from "frontend/services/internet-identity/crypto/pow"
import {
  canisterIdPrincipal as iiCanisterIdPrincipal,
  creationOptions,
} from "frontend/services/internet-identity/iiConnection"
import { getBrowser, getPlatformInfo } from "frontend/utils"
import React from "react"
import { useSearchParams } from "react-router-dom"

export const useMultipass = () => {
  const [params] = useSearchParams()

  const createWebAuthNIdentity = React.useCallback(async () => {
    const deviceName = `${getBrowser()} on ${getPlatformInfo().os}`
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, iiCanisterIdPrincipal)

    return { identity: JSON.stringify(identity.toJSON()), deviceName, pow }
  }, [])

  return {
    ...useAccount(),
    ...usePersona(),
    createWebAuthNIdentity,
    applicationName: params.get("applicationName"),
  }
}
