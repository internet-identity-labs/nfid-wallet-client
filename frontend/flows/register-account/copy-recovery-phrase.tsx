import {
  Button,
  Card,
  CardBody,
  CardTitle,
  H3,
  P,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { HiCheck, HiClipboard } from "react-icons/hi"
import { useLocation, useNavigate } from "react-router-dom"
import { useStartUrl } from "frontend/hooks/use-start-url"

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
  const navigate = useNavigate()
  const startUrl = useStartUrl()
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

          <div className="p-4 border border-black rounded">
            <div className="mb-5 font-bold text-center text-indigo-600 uppercase">
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
                <HiCheck className="mr-2 text-lg" />
              ) : (
                <HiClipboard className="mr-2 text-lg" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <Button
            onClick={() => navigate(startUrl || "")}
            disabled={!copied}
            filled
            block
            className="flex items-center justify-center mx-auto mt-6 mb-2 space-x-4"
          >
            Login
          </Button>

          <Button
            disabled={!copied}
            block
            className="flex items-center justify-center mx-auto space-x-4"
          >
            Link existing account
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
