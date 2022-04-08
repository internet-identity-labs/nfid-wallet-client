import { CopyIcon } from "@identity-labs/nfid-sdk-react"
import {
  Button,
  Card,
  CardBody,
  H2,
  H5,
  Loader,
  Modal,
  P,
} from "@identity-labs/nfid-sdk-react"
import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"

import { ProfileConstants } from "../profile/routes"

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
  const { secret, scope } = useParams()
  const { isLoading, setIsloading } = useIsLoading()
  const { applicationName } = useMultipass()
  const { remoteLogin } = useAuthorizeApp()
  const { state } = useLocation()

  const recoveryPhrase = React.useMemo(() => {
    return (
      (state as LocationState)?.recoveryPhrase ?? `123456 ${generate().trim()}`
    )
  }, [state])

  const { nextPersonaId, createPersona } = usePersona()

  const [copied, setCopied] = React.useState(false)
  const [successModal, setShowSuccessModal] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(function () {
      setCopied(true)
    })
  }

  const handleAuthorizePersona = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({ domain: scope })
    if (response?.status_code === 200) {
      if (!secret || !scope) throw new Error("missing secret or scope")
      await remoteLogin({ secret, scope, persona_id: nextPersonaId })
      setIsloading(false)
      return setShowSuccessModal(true)
    }
    console.error(response)
  }, [createPersona, nextPersonaId, remoteLogin, scope, secret, setIsloading])

  return (
    <AppScreen isFocused>
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
            onClick={handleAuthorizePersona}
            disabled={!copied}
            secondary
            large
            className="mt-8"
          >
            Log in to {applicationName || "NFID Demo"}.
          </Button>
        </CardBody>
      </Card>
      <Loader isLoading={isLoading} />
      {successModal ? (
        <Modal
          title={"Success!"}
          description={`You signed in to ${applicationName || "NFID Demo"}`}
          buttonText="Done"
          iconType="success"
          onClick={() => {
            navigate(
              `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
            )
          }}
        />
      ) : null}
    </AppScreen>
  )
}
