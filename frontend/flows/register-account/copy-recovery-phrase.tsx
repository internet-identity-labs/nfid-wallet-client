import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useStartUrl } from "frontend/hooks/use-start-url"
import { CopyIcon } from "frontend/ui-kit/src/components/atoms/button/icons/copy"
import { Button, Card, CardBody, H2, H5, P } from "frontend/ui-kit/src/index"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom"

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
  const { applicationName } = useMultipass()
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
      <H5 className="mt-8">Congratulations!</H5>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-11 lg:col-span-7">
          <H2 className="leading-10">
            You're now the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6040d3] to-[#8f18ce]">
              owner
            </span>{" "}
            of your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0390dc] to-[#633ed4]">
              Internet Identity
            </span>
          </H2>

          <P className="my-6">
            Secret recovery phrase. This is the only way you will be able to
            recover your account. Save this recovery phrase somewhere safe!
          </P>

          <div className="p-4 border border-black-base rounded-t">
            <P className="font-mono">{recoveryPhrase}</P>
          </div>

          <Button
            secondary
            className="!rounded-t-none w-full flex items-center justify-center space-x-3 focus:outline-none"
            onClick={() => copyToClipboard()}
          >
            <CopyIcon />
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            onClick={() => navigate(startUrl || "")}
            disabled={!copied}
            secondary
            large
            className="mt-8"
          >
            Log in to {applicationName}
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
