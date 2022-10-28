import { HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"
import { Button, H1 } from "@nfid-frontend/ui"
import {
  requestPhoneNumberCredential,
  verifyPhoneNumberCredential,
} from "@nfid/credentials"
import clsx from "clsx"
import React from "react"
import { ImSpinner } from "react-icons/im"

import { environment } from "../../environments/environment"
import { PageTemplate } from "../page-template"

let identity: DelegationIdentity

interface ButtonState {
  disabled: boolean
  loading: boolean
  label: string
}

const useButtonState = ({
  disabled = false,
  loading = false,
  label = "Submit",
}: Partial<ButtonState> = {}) =>
  React.useReducer(
    (state: ButtonState, newState: Partial<ButtonState>): ButtonState => ({
      ...state,
      ...newState,
    }),
    {
      disabled,
      loading,
      label,
    },
  )

export const PagePhoneNumberVerification: React.FC = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })
  const [credButton, updateCredButton] = useButtonState({
    disabled: true,
    label: "Request Credential",
  })
  const [verify, setVerify] = React.useState("")
  const [certificate, setCertificate] = React.useState("")
  const [principal, setPrincipal] = React.useState("")

  console.log(">> PagePhoneNumberVerification", {
    authButton,
    credButton,
    verify,
    certificate,
    principal,
  })

  const handleAuthenticate = React.useCallback(async () => {
    const authClient = await AuthClient.create()
    updateAuthButton({ loading: true, label: "Authenticating..." })
    await authClient.login({
      onSuccess: () => {
        identity = authClient.getIdentity() as DelegationIdentity
        if (!(window as any).ic) (window as any).ic = {}
        ;(window as any).ic.agent = new HttpAgent({
          identity,
          host: "https://ic0.app",
        })
        updateAuthButton({
          disabled: true,
          loading: false,
          label: "Authenticated",
        })
        updateCredButton({ disabled: false })
        setPrincipal(`Principal: ${identity.getPrincipal().toText()}`)
      },
      onError: (error) => {
        console.error(error)
      },
      identityProvider: `${environment.nfidProviderOrigin}/authenticate`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  }, [updateAuthButton, updateCredButton])

  const handleCreateCredential = React.useCallback(async () => {
    updateCredButton({
      disabled: true,
      loading: true,
      label: "Waiting for approval...",
    })
    requestPhoneNumberCredential(identity, {
      provider: new URL(
        `${environment.nfidProviderOrigin}/credential/verified-phone-number`,
      ),
      verifier: environment.verifierCanisterId,
    })
      .then((result) => {
        setCertificate(JSON.stringify(result, null, 2))
        if (result.status === "SUCCESS") {
          updateCredButton({ loading: false, label: "Complete!" })
          setVerify("Verifying credential...")
          return verifyPhoneNumberCredential(
            identity.getPrincipal().toText(),
            environment.verifierCanisterId,
          )
        }
        return undefined
      })
      .then((r) => {
        setVerify(r ? "Phone number verified!" : "Could not verify credential.")
      })
      .then(() =>
        updateCredButton({
          disabled: false,
          loading: false,
          label: "Request Credential",
        }),
      )
      .catch((e) => {
        console.error(e)
        updateCredButton({ disabled: false, label: "Request Credential" })
        setCertificate(`Problem getting credential: ${e}`)
      })
  }, [updateCredButton])

  return (
    <PageTemplate title="Phone number credential">
      <H1 className="title">Phone Number Credentials Example</H1>
      <div className="subtitle">Step One: Authenticate</div>
      <div>
        Learn about auth with NFID
        <a
          href="https://docs.nfid.one/basic-installation"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
      </div>
      <Button
        primary
        disabled={authButton.disabled}
        onClick={handleAuthenticate}
      >
        {authButton.loading ? (
          <div className={clsx("flex items-center space-x-2")}>
            <ImSpinner className={clsx("animate-spin")} />
            <div>{authButton.label}</div>
          </div>
        ) : (
          authButton.label
        )}
      </Button>
      <pre className="response" id="principal">
        {principal}
      </pre>
      <div className="subtitle">Step Two: Request Phone Number Credential</div>
      <pre>
        {`
import {requestPhoneNumberCredential} from '@nfid/credentials';
requestPhoneNumberCredential(identity)
        `}
      </pre>
      <Button
        primary
        id="credential"
        disabled={credButton.disabled}
        onClick={handleCreateCredential}
      >
        {credButton.loading ? (
          <div className={clsx("flex items-center space-x-2")}>
            <ImSpinner className={clsx("animate-spin")} />
            <div>{credButton.label}</div>
          </div>
        ) : (
          credButton.label
        )}
      </Button>
      <pre className="response" id="certificate">
        {certificate}
      </pre>
      <div className="subtitle">Step Three: Verify Credential</div>
      <pre>
        {`
import {verifyPhoneNumberCredential} from '@nfid/credentials';
verifyPhoneNumberCredential(result.clientPrincipal)
        `}
      </pre>
      <pre className="response" id="verify">
        {verify}
      </pre>
      <div className="subtitle">Step Four: Backend Verify</div>
      <div>
        Before performing sensitive actions you should verify the credential in
        a backend context, since a bad actor might fake some data on the
        frontend. If your backend uses javascript, you can use the same
        verification method as above. If not, you can use the verification
        canister's
        <code>is_phone_number_approved(principal: string)</code> method
        directly.
      </div>
    </PageTemplate>
  )
}
