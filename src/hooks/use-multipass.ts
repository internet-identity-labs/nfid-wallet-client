import { WebAuthnIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import React from "react"
import { useParams, useSearchParams } from "react-router-dom"

import { creationOptions } from "frontend/services/internet-identity/iiConnection"

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

    return {
      identity: JSON.stringify(identity.toJSON()),
      deviceName: newDeviceName,
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
