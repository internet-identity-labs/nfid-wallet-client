import {
  Button,
  Loader,
  H2,
  TextArea,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useMessageChannel } from "frontend/screens/authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"
import { parseUserNumber } from "frontend/services/internet-identity/userNumber"

interface RestoreAccessPointRecoveryPhraseContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  registerDevicePath: string
  onRecoverSuccess?: (result: LoginSuccess) => void
}

export const RecoverNFID: React.FC<
  RestoreAccessPointRecoveryPhraseContentProps
> = ({ className, registerDevicePath, onRecoverSuccess }) => {
  const { navigate } = useNFIDNavigate()
  const { loginWithRecovery, error, isLoading } = useAuthentication()
  const { handleStoreNewDevice, setUserNumber } = useUnknownDeviceConfig()

  const handleNewDevice = React.useCallback(
    async (event) => {
      await handleStoreNewDevice(event.data)
    },
    [handleStoreNewDevice],
  )

  useMessageChannel({
    messageHandler: {
      "new-device": handleNewDevice,
    },
  })

  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
  } = useForm({
    mode: "all",
  })

  const onRecover = React.useCallback(
    async (data: any) => {
      const { recoveryPhrase } = data

      const stringUserNumber = recoveryPhrase.split(" ")[0]
      const userNumber = parseUserNumber(stringUserNumber)

      if (!userNumber) {
        return setError("recoveryPhrase", {
          type: "manual",
          message: "Invalid Recovery Phrase (missing Anchor)",
        })
      }

      const result = await loginWithRecovery(
        recoveryPhrase.split(`${userNumber} `)[1],
        userNumber,
      )

      if (result?.tag === "ok") {
        setUserNumber(userNumber)
        navigate(registerDevicePath)
        onRecoverSuccess && onRecoverSuccess(result)
      } else {
        setError("recoveryPhrase", {
          type: "manual",
          message:
            "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        })
      }
    },
    [
      loginWithRecovery,
      setError,
      setUserNumber,
      navigate,
      registerDevicePath,
      onRecoverSuccess,
    ],
  )

  const title = "Recover NFID"

  React.useEffect(() => {
    if (error) {
      setError("recoveryPhrase", {
        type: "manual",
        message:
          "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      })
    }
  }, [error, setError])

  return (
    <div className={clsx("", className)}>
      <div>
        <H2 className="mb-4">{title}</H2>

        <div className={clsx("mb-6")}>
          Paste your recovery phrase here to proceed:
        </div>

        <TextArea
          rows={6}
          errorText={errors.recoveryPhrase?.message}
          {...register("recoveryPhrase", {
            required: {
              value: true,
              message: "Please enter your Recovery Phrase",
            },
          })}
        />

        <Button
          secondary
          large
          className="my-4"
          onClick={handleSubmit(onRecover)}
        >
          Recover
        </Button>

        <Loader isLoading={isLoading} />
      </div>
    </div>
  )
}
