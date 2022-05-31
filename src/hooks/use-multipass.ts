import React from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { WebAuthnIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"

import { creationOptions } from "frontend/services/internet-identity/iiConnection"
import { useDeviceInfo } from "./use-device-info"
import Logo from 'frontend/assets/logo.svg';


const applicationNameAtom = atom<string | undefined>(undefined);
const applicationLogoAtom = atom<string | undefined>(Logo as string);

export const useMultipass = () => {
  const [queryString] = useSearchParams()
  const { applicationName: applicationNameFromPath } = useParams()
  const [applicationName, setApplicationName] = useAtom(applicationNameAtom)
  const [applicationLogo, setApplicationLogo] = useAtom(applicationLogoAtom)
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
    const applicationNameFromParams = queryString.get("applicationName")
    const applicationLogoFromParams = queryString.get("applicationLogo")

    if (
      !applicationName &&
      (applicationNameFromParams || applicationNameFromPath)
    ) {
      setApplicationName(
        applicationNameFromParams || applicationNameFromPath || "NFID",
      )
    }
    if (applicationLogoFromParams) {
      setApplicationLogo(applicationLogoFromParams);
    }
  }, [applicationName, applicationLogo, applicationNameFromPath, queryString, setApplicationName, setApplicationLogo])

  return {
    createWebAuthNIdentity,
    applicationName,
    applicationLogo,
    setApplicationName,
  }
}
