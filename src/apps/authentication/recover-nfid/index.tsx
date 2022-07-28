import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { FieldValues } from "react-hook-form"

import { parseUserNumber } from "frontend/integration/internet-identity/userNumber"
import { CONTAINER_CLASSES } from "frontend/ui/atoms/container"
import { RecoverNFID } from "frontend/ui/pages/recover-nfid"
import { useMessageChannel } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { useAuthentication } from "../use-authentication"
import { NewDeviceEvent } from "./types"

interface RestoreAccessPointRecoveryPhraseProps {
  registerDeviceDeciderPath: string
  isVerifiedDomainDefault?: boolean
}

export const AppScreenRecoverNFID: React.FC<
  RestoreAccessPointRecoveryPhraseProps
> = ({ registerDeviceDeciderPath, isVerifiedDomainDefault }) => {
  const [responseError, setResponseError] = useState<any>(null)
  const [isVerifiedDomain, toggleIsVerifiedDomain] = React.useReducer(
    (state) => !state,
    !!isVerifiedDomainDefault,
  )

  const { navigate } = useNFIDNavigate()
  const { loginWithRecovery, error, isLoading, user } = useAuthentication()
  const { handleStoreNewDevice, setUserNumber } = useUnknownDeviceConfig()

  const handleNewDevice = React.useCallback(
    async (event: NewDeviceEvent) => {
      await handleStoreNewDevice(event.data)
    },
    [handleStoreNewDevice],
  )

  useMessageChannel({
    messageHandler: {
      "new-device": handleNewDevice,
    },
  })

  const onRecover = React.useCallback(
    async (data: FieldValues) => {
      const recoveryPhrase = data.recoveryPhrase.trim()

      const stringUserNumber = recoveryPhrase.split(" ")[0]
      const userNumber = parseUserNumber(stringUserNumber)
      const seedPhrase = recoveryPhrase.split(`${userNumber} `)[1]

      console.log({ recoveryPhrase, stringUserNumber, userNumber, seedPhrase })

      if (!userNumber) {
        return setResponseError("Invalid Recovery Phrase (missing Anchor)")
      }

      let result = null

      try {
        result = await loginWithRecovery(
          recoveryPhrase.split(`${userNumber} `)[1],
          userNumber,
        )
      } catch {
        setResponseError(
          "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        )
      }

      console.log({ result })

      if (result?.tag !== "ok") {
        setResponseError(
          "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        )
      }

      setUserNumber(userNumber)
      navigate(registerDeviceDeciderPath)
    },
    [
      loginWithRecovery,
      setResponseError,
      setUserNumber,
      navigate,
      registerDeviceDeciderPath,
    ],
  )

  useEffect(() => {
    console.log({ user })
  }, [user])

  return (
    <RecoverNFID
      onRecover={onRecover}
      toggle={toggleIsVerifiedDomain}
      isVerifiedDomain={isVerifiedDomain}
      responseError={responseError}
      isLoading={isLoading}
    />
  )
}
