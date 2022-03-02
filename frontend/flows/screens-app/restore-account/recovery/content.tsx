import React from "react"
import clsx from "clsx"
import { Button } from "components/atoms/button"
import { Loader } from "components/atoms/loader"
import { H5, H2 } from "components/atoms/typography"
import { DropdownMenu } from "components/molecules/menu"
import { Label, MenuItem, TextArea } from "frontend/ui-kit/src"
import { title } from "process"
import { useForm } from "react-hook-form"
import { useAuthentication } from "frontend/hooks/use-authentication"

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
  const { loginWithRecovery } = useAuthentication()

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({
    mode: "all",
  })

  const onLogin = React.useCallback(
    async (data: any) => {
      const { recoveryPhrase } = data

      const result = await loginWithRecovery(recoveryPhrase)

      console.log("onLogin :>> ", result)
    },
    [loginWithRecovery],
  )

  const title = "Log in with Recovery Phrase"

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
          {...register("recoveryPhrase", {
            required: true,
          })}
        />

        <Button
          secondary
          block={iframe}
          large={!iframe}
          className="my-4"
          onClick={handleSubmit(onLogin)}
          disabled={!isValid}
        >
          Log in
        </Button>

        {/* <Loader isLoading={} iframe={iframe} /> */}
      </div>
    </div>
  )
}
