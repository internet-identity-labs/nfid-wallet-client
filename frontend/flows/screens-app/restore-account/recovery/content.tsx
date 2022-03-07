import clsx from "clsx"
import { Button } from "components/atoms/button"
import { Loader } from "components/atoms/loader"
import { H2, H5 } from "components/atoms/typography"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { TextArea } from "frontend/ui-kit/src"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

interface RestoreAccessPointRecoveryPhraseContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const RestoreAccessPointRecoveryPhraseContent: React.FC<
  RestoreAccessPointRecoveryPhraseContentProps
> = ({ children, className, iframe }) => {
  const { loginWithRecovery, error, isLoading } = useAuthentication()
  const navigate = useNavigate()

  const {
    register,
    formState: { errors, isValid },
    setError,
    handleSubmit,
  } = useForm({
    mode: "all",
  })

  const onLogin = React.useCallback(
    async (data: any) => {
      const { recoveryPhrase } = data

      const result = await loginWithRecovery(recoveryPhrase)

      if (result?.tag === "ok") {
        console.log('"success" :>> ', "success! navigate me")
      } else {
        setError("recoveryPhrase", {
          type: "manual",
          message: "Invalid Recovery Phrase",
        })
      }
    },
    [loginWithRecovery, setError],
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
          onClick={handleSubmit(onLogin)}
        >
          Log in
        </Button>

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>
    </div>
  )
}
