import { WebAuthnIdentity } from "@dfinity/identity"
import { getProofOfWork } from "frontend/services/internet-identity/crypto/pow"
import {
  canisterIdPrincipal as iiCanisterIdPrincipal,
  creationOptions,
} from "frontend/services/internet-identity/iiConnection"
import { atom, useAtom } from "jotai"
import React from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useDeviceInfo } from "./use-device-info"

const applicationNameAtom = atom<string | undefined>(undefined)

export const useMultipass = () => {
  const [params] = useSearchParams()
  const { applicationName: applicationNameFromPath } = useParams()
  const [applicationName, setApplicationName] = useAtom(applicationNameAtom)
  const { newDeviceName } = useDeviceInfo()

  const createWebAuthNIdentity = React.useCallback(async () => {
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, iiCanisterIdPrincipal)

    return {
      identity: JSON.stringify(identity.toJSON()),
      deviceName: newDeviceName,
      pow,
    }
  }, [newDeviceName])

  React.useEffect(() => {
    const applicationNameFromParams = params.get("applicationName")
    if (
      !applicationName &&
      (applicationNameFromParams || applicationNameFromPath)
    ) {
      setApplicationName(applicationNameFromParams || applicationNameFromPath)
    }
  }, [applicationName, applicationNameFromPath, params, setApplicationName])

  return {
    createWebAuthNIdentity,
    applicationName,
    setApplicationName,
  }
}
