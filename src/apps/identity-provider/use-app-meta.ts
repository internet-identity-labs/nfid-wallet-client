import { WebAuthnIdentity } from "@dfinity/identity"
import { atom, useAtom } from "jotai"
import React from "react"
import { useParams, useSearchParams } from "react-router-dom"

import { creationOptions } from "frontend/integration/services/internet-identity/iiConnection"

import { useDeviceInfo } from "../device/use-device-info"

const applicationNameAtom = atom<string | undefined>(undefined)
const applicationDerivationOriginAtom = atom<string | undefined>(undefined)
const applicationLogoAtom = atom<string | undefined>(undefined)

export const useMultipass = () => {
  const [queryString] = useSearchParams()
  const {
    applicationName: applicationNameFromPath,
    applicationLogo: applicationLogoFromPath,
    applicationDerivationOrigin: applicationDerivationOriginFromPath,
  } = useParams()
  const [applicationName, setApplicationName] = useAtom(applicationNameAtom)
  const [applicationLogo, setApplicationLogo] = useAtom(applicationLogoAtom)
  const [applicationDerivationOrigin, setApplicationDerivationOrigin] = useAtom(
    applicationDerivationOriginAtom,
  )
  const { newDeviceName } = useDeviceInfo()

  // TODO: Refactor into device app
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
    const applicationDerivationOriginFromParams =
      queryString.get("derivationOrigin")

    setApplicationDerivationOrigin(
      applicationDerivationOriginFromParams ??
        applicationDerivationOriginFromPath ??
        undefined,
    )

    if (
      !applicationName &&
      (applicationNameFromParams || applicationNameFromPath)
    ) {
      setApplicationName(
        applicationNameFromParams || applicationNameFromPath || "NFID",
      )
    }
    if (applicationLogoFromParams || applicationLogoFromPath) {
      setApplicationLogo(applicationLogoFromParams || applicationLogoFromPath)
    }
  }, [
    applicationName,
    applicationLogo,
    applicationNameFromPath,
    queryString,
    setApplicationName,
    setApplicationLogo,
    applicationLogoFromPath,
    setApplicationDerivationOrigin,
    applicationDerivationOriginFromPath,
  ])

  return {
    createWebAuthNIdentity,
    applicationName,
    applicationLogo,
    applicationDerivationOrigin,
    setApplicationName,
  }
}
