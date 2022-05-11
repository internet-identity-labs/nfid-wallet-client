import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { Loader } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import { TextArea } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useMessageChannel } from "frontend/screens/authorize-app-unknown-device/hooks/use-message-channel"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { parseUserNumber } from "frontend/services/internet-identity/userNumber"

interface RestoreAccessPointRecoveryPhraseContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const RestoreAccessPoint: React.FC<
  RestoreAccessPointRecoveryPhraseContentProps
> = ({ className, iframe }) => {
  const { loginWithRecovery, error, isLoading, isAuthenticated } =
    useAuthentication()
  const { setLocalAccount } = useAccount()
  const { handleStoreNewDevice, setUserNumber } = useUnknownDeviceConfig()
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

  const onLogin = React.useCallback(
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
        setLocalAccount({ anchor: userNumber.toString() })
        navigate("/login-unknown-device")
      } else {
        setError("recoveryPhrase", {
          type: "manual",
          message:
            "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        })
      }
    },
    [navigate, loginWithRecovery, setError, setLocalAccount, setUserNumber],
  )

  const title = "Log in with Recovery Phrase"

  React.useEffect(() => {
    if (error) {
      setError("recoveryPhrase", {
        type: "manual",
        message:
          "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      })
    }
  }, [error, setError])

  if (isAuthenticated) return <Navigate to={"/profile"} />

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
          onClick={handleSubmit(onLogin)}
        >
          Log in
        </Button>

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>
    </div>
  )
}
