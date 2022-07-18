import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import {
  Button,
  Loader,
  H2,
  TextArea,
} from "@internet-identity-labs/nfid-sdk-react"

import { useMessageChannel } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "frontend/design-system/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { LoginSuccess } from "frontend/comm/services/internet-identity/api-result-to-login-result"
import { parseUserNumber } from "frontend/comm/services/internet-identity/userNumber"
import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

interface RecoverNFIDProps extends React.HTMLAttributes<HTMLDivElement> {
  registerDevicePath: string
  onRecoverSuccess?: (result: LoginSuccess) => void
  hasVerifiedDomain?: boolean
}

export const RecoverNFID: React.FC<RecoverNFIDProps> = ({
  className,
  registerDevicePath,
  hasVerifiedDomain: hasVerifiedDomainDefault,
  onRecoverSuccess,
}) => {
  const [hasVerifiedDomain, toggle] = React.useReducer(
    (state) => !state,
    !!hasVerifiedDomainDefault,
  )

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
      const { recoveryPhrase: recoveryPhraseRaw } = data
      const recoveryPhrase = recoveryPhraseRaw.trim()

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
      onRecoverSuccess,
      registerDevicePath,
    ],
  )

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
        <H2 className="mb-4">Recover NFID</H2>

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
        <div>
          <input
            type="checkbox"
            id="has-verified-domain"
            className="rounded"
            onChange={toggle}
            checked={hasVerifiedDomain}
          />
          <label htmlFor="has-verified-domain" className="ml-2">
            I got to this screen by first going to https://nfid.one, being
            redirected to this landing page, and following the link to recover
            my NFID.
          </label>
        </div>

        <Button
          secondary
          large
          className="my-4"
          onClick={handleSubmit(onRecover)}
          disabled={!hasVerifiedDomain}
        >
          Recover
        </Button>

        <Loader isLoading={isLoading} />
      </div>
    </div>
  )
}
