import { Actor, HttpAgent } from "@dfinity/agent"
import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { CONFIG } from "frontend/config"
import { getBrowser, getPlatform } from "frontend/utils"
import { Topic, _SERVICE } from "frontend/generated/identity_manager"
import React from "react"
import { idlFactory as identity_manager_idl } from "frontend/generated/identity_manager_idl"
import {
  canisterIdPrincipal as iiCanisterIdPrincipal,
  creationOptions,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import { useAccount } from "frontend/modules/account/hooks"
import { usePersona } from "frontend/modules/persona/hooks"
import { getProofOfWork } from "frontend/utils/internet-identity/crypto/pow"

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
export const baseActor = Actor.createActor<_SERVICE>(identity_manager_idl, {
  agent: getAgent(),
  canisterId,
})

export const useMultipass = () => {
  const { account, getAccount, updateAccount, createAccount } = useAccount()
  const { persona, getPersona, updatePersona, createPersona } = usePersona()

  const createWebAuthNIdentity = React.useCallback(async () => {
    const deviceName = `${getBrowser()} on ${getPlatform()}`
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, iiCanisterIdPrincipal)

    return { identity: JSON.stringify(identity.toJSON()), deviceName, pow }
  }, [])

  const createTopic = React.useCallback(async (key: Topic) => {
    return await baseActor.create_topic(key)
  }, [])
  const deleteTopic = React.useCallback(async (key: Topic) => {
    return await baseActor.delete_topic(key)
  }, [])

  const getMessages = React.useCallback(async (key: Topic) => {
    return await baseActor.get_messages(key)
  }, [])

  const postMessages = React.useCallback(
    async (key: Topic, messages: string[]) => {
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
      const message = JSON.stringify({
        publicKey,
        rawId: blobToHex(identity.rawId),
        deviceName: `${getBrowser()} on ${getPlatform()}`,
      })

      await postMessages(secret, [message])
      return { publicKey }
    },
    [postMessages],
  )

  return {
    account,
    getAccount,
    createAccount,
    updateAccount,
    persona,
    getPersona,
    createPersona,
    updatePersona,
    createWebAuthNIdentity,
    handleAddDevice,
    createTopic,
    deleteTopic,
    getMessages,
    postMessages,
  }
}
