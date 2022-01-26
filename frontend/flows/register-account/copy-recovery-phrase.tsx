import { Button, Card, CardBody, CardTitle, H3, P } from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { HiCheck, HiClipboard } from "react-icons/hi"
import { useLocation } from "react-router-dom"

interface RegisterAccountCopyRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface LocationState {
  recoveryPhrase: string
}

export const RegisterAccountCopyRecoveryPhrase: React.FC<
  RegisterAccountCopyRecoveryPhraseProps
> = ({ children, className }) => {
  const { state } = useLocation()
  const { recoveryPhrase } = state as LocationState

  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(function () {
      setCopied(true)
    })
  }

  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Congratulations!</CardTitle>
        <CardBody className="max-w-lg">
          <H3>You're now the owner of your Internet Identity</H3>
          <P className="pb-3">
            Secret recovery phrase. This is the only way you will be able to
            recover your account. Save this recovery phrase somewhere safe!
          </P>

          <div className="border border-black rounded p-4">
            <div className="uppercase font-bold text-center mb-5 text-indigo-600">
              You need to save this!
            </div>

            <P>{recoveryPhrase}</P>

            <Button
              className={clsx(
                "flex ml-auto justify-center mt-4",
                copied
                  ? "border-indigo-700 text-indigo-700"
                  : "border-indigo-500 text-indigo-500",
              )}
              onClick={() => copyToClipboard()}
            >
              {copied ? (
                <HiCheck className="text-lg mr-2" />
              ) : (
                <HiClipboard className="text-lg mr-2" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <Button
            disabled={!copied}
            filled
            block
            className="flex justify-center space-x-4 items-center mx-auto mb-2 mt-6"
          >
            Login
          </Button>

          <Button
            disabled={!copied}
            block
            className="flex justify-center space-x-4 items-center mx-auto"
          >
            Link existing account
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
