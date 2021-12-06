import { Actor, HttpAgent } from "@dfinity/agent"
import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { CONFIG } from "frontend/config"
import { getBrowser, getPlatform } from "frontend/flows/register/utils"
import { getProofOfWork } from "frontend/ii-utils/crypto/pow"
import {
  DelegationKey,
  _SERVICE,
} from "frontend/ii-utils/generated/internet_identity_types"
import { creationOptions, IIConnection } from "frontend/ii-utils/iiConnection"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "frontend/modules/account/constants"
import { Account } from "frontend/modules/account/types"
import React from "react"
import { idlFactory as internet_identity_idl } from "../ii-utils/generated/internet_identity_idl"
import { canisterIdPrincipal as iiCanisterIdPrincipal } from "frontend/ii-utils/iiConnection"
import { useAccount } from "frontend/modules/account/hooks"
import { usePersona } from "frontend/modules/persona/hooks"

const canisterId: string = CONFIG.MP_CANISTER_ID as string

if (!canisterId)
  throw new Error("you need to add VITE_MP_CANISTER_ID to your environment")
const getAgent = () => {
  const agent = new HttpAgent({})
  // Only fetch the root key when we're not in prod
  if (CONFIG.II_ENV === "development") {
    agent.fetchRootKey()
  }
  return agent
}
export const canisterIdPrincipal: Principal = Principal.fromText(canisterId)
export const baseActor = Actor.createActor<_SERVICE>(internet_identity_idl, {
  agent: getAgent(),
  canisterId,
})

export const useMultipass = () => {
  const { account, getAccount, updateAccount } = useAccount()
  const { persona, getPersona, updatePersona } = usePersona()

  const createWebAuthNIdentity = React.useCallback(async () => {
    const deviceName = `${getBrowser()} on ${getPlatform()}`
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, iiCanisterIdPrincipal)

    return { identity: JSON.stringify(identity.toJSON()), deviceName, pow }
  }, [])

  const getMessages = React.useCallback(async (key: DelegationKey) => {
    return await baseActor.get_messages(key)
  }, [])

  const postMessages = React.useCallback(
    async (key: DelegationKey, messages: string[]) => {
      return await baseActor.post_messages(key, messages)
    },
    [],
  )

  const handleAddDevice = React.useCallback(
    async (secret: string, userNumber: bigint) => {
      const existingDevices = await IIConnection.lookupAll(userNumber)

      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
      const publicKey = identity.getPublicKey().toDer()
      await postMessages(secret, [
        JSON.stringify({
          publicKey,
          rawId: blobToHex(identity.rawId),
          deviceName: `${getBrowser()} on ${getPlatform()}`,
        }),
      ])
      return { publicKey }
    },
    [postMessages],
  )

  return {
    account,
    getAccount,
    updateAccount,
    persona,
    getPersona,
    updatePersona,
    createWebAuthNIdentity,
    handleAddDevice,
    getMessages,
    postMessages,
  }
}
