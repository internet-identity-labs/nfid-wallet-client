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
      <H5 className="mt-8">This device is now equipped for Web 3.0</H5>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-11 lg:col-span-7">
          <H2 className="leading-10">Your NFID is ready</H2>

          <P className="my-6">
            This recovery phrase is the only backup to access your NFID in case
            all other access points are lost. Keep this secret, safe, and
            offline!
          </P>

          <div className="p-4 border rounded-t border-black-base">
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
            Log in to {applicationName || "NFID Demo"}
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
