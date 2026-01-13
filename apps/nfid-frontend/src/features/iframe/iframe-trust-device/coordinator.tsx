import { WebAuthnIdentity } from "@dfinity/identity"

import { useCallback, useEffect, useMemo, useState } from "react"

import { isWebAuthNSupported } from "frontend/integration/device"
import { creationOptions } from "frontend/integration/webauthn/creation-options"

import { IframeTrustDevice } from "."

export default function IframeTrustDeviceCoordinator() {
  const [userDevices, setUserDevices] = useState(undefined)

  useEffect(() => {
    window.postMessage({ ready: true })
  }, [])

  useEffect(() => {
    const getPostedDevices = (e: MessageEvent<any>) => {
      if ("devices" in e?.data && !userDevices) {
        setUserDevices(e.data.devices)
        window.removeEventListener("message", getPostedDevices)
      }
    }

    window.addEventListener("message", getPostedDevices)

    return () => window.removeEventListener("message", getPostedDevices)
  }, [userDevices])

  const isWebAuthN = useMemo(() => {
    return isWebAuthNSupported()
  }, [])

  const onCreateIdentity = useCallback(async () => {
    try {
      const identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(userDevices),
      })
      window.postMessage(
        {
          isDeviceTrusted: true,
          identity: JSON.stringify(identity.toJSON()),
          isWebAuthN,
        },
        window.opener.origin,
      )
    } catch {
      window.postMessage({ isDeviceTrusted: true }, window.opener.origin)
    } finally {
      window.close()
    }
  }, [isWebAuthN, userDevices])

  const onSkip = useCallback(() => {
    window.postMessage({ isDeviceTrusted: false }, window.opener.origin)
    window.close()
  }, [])

  return (
    <IframeTrustDevice
      isLoading={!userDevices}
      isWebAuthN={isWebAuthN}
      onSkip={onSkip}
      onTrust={onCreateIdentity}
    />
  )
}
