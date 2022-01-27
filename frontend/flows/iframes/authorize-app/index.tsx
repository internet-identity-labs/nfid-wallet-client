import React from "react"
import { useAuthorization } from "../nfid-login/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { Button } from "frontend/ui-kit/src/components/atoms/button"
import {
  IIPersona,
  NFIDPersona,
} from "frontend/services/identity-manager/persona/types"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useAuthentication } from "frontend/flows/auth-wrapper"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  const { identityManager } = useAuthentication()
  const { userNumber, account } = useAccount()
  const { createPersona } = usePersona({ personaService: identityManager })

  const { authorizationRequest, authorizeApp } = useAuthorization({
    userNumber,
  })
  const { personas } = usePersona({
    application: authorizationRequest?.hostname,
  })

  const nfidPersonas =
    personas && (personas as NFIDPersona[]).filter((p) => p.persona_id)

  const iiPersonas =
    personas && (personas as IIPersona[]).filter((p) => p.anchor)

  return (
    <IFrameScreen title={account && `Welcome ${account.name}`}>
      <div className="px-6 py-4">
        {nfidPersonas?.map(({ persona_id }) => (
          <Button
            key={persona_id}
            block
            filled
            onClick={() => authorizeApp({ persona_id })}
            className="mt-1"
          >
            Continue as NFID persona {persona_id}
          </Button>
        ))}
        <Button
          block
          filled
          color="white"
          onClick={() =>
            createPersona({ personaId: "3", domain: "localhost:3000" })
          }
          className="mt-1"
        >
          Create new persona
        </Button>
      </div>
      <div className="px-6 py-4">
        {iiPersonas?.map(({ anchor }) => (
          <Button
            key={anchor}
            block
            filled
            onClick={() => authorizeApp({ anchor })}
            className="mt-1"
          >
            Continue as NFID persona {anchor}
          </Button>
        ))}
      </div>
    </IFrameScreen>
  )
}
