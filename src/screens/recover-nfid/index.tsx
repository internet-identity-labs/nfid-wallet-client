import {
  Button,
  Loader,
  H2,
  H5,
  TextArea,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useGeneratePath } from "frontend/hooks/use-generate-path"
import { useMessageChannel } from "frontend/screens/authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"
import { parseUserNumber } from "frontend/services/internet-identity/userNumber"

interface RestoreAccessPointRecoveryPhraseContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
  registerDeviceDeciderPath: string
  onRecoverSuccess?: (result: LoginSuccess) => void
}

export const RecoverNFID: React.FC<
  RestoreAccessPointRecoveryPhraseContentProps
> = ({ className, iframe, registerDeviceDeciderPath, onRecoverSuccess }) => {
  const { generatePath } = useGeneratePath()
  const { loginWithRecovery, error, isLoading } = useAuthentication()
  const { handleStoreNewDevice } = useUnknownDeviceConfig()
  const navigate = useNavigate()

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
        navigate(generatePath(registerDeviceDeciderPath))
        onRecoverSuccess && onRecoverSuccess(result)
      } else {
        setError("recoveryPhrase", {
          type: "manual",
          message: "Invalid Recovery Phrase",
        })
      }
    },
    [
      loginWithRecovery,
      setError,
      navigate,
      generatePath,
      registerDeviceDeciderPath,
      onRecoverSuccess,
    ],
  )

  const title = "Log in with Recovery Phrase"

  React.useEffect(() => {
    if (error) {
      setError("recoveryPhrase", {
        type: "manual",
        message: "Invalid Recovery Phrase",
      })
    }
  }, [error, setError])

  return (
    <div className={clsx("", className)}>
      <div>
        {iframe ? (
          <H5 className="mb-4">{title}</H5>
        ) : (
          <H2 className="mb-4">{title}</H2>
        )}

        <div className={clsx(iframe ? "mb-2" : "mb-6")}>
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
          block={iframe}
          large={!iframe}
          className="my-4"
          onClick={handleSubmit(onRecover)}
        >
          Recover
        </Button>

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>
    </div>
  )
}
