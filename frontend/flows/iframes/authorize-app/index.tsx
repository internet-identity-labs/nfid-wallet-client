import React from "react"
import { useAuthentication } from "../nfid-login/hooks"
import { usePersona } from "frontend/modules/persona/hooks"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAccount } from "frontend/modules/account/hooks"
import { Button } from "frontend/ui-kit/src/components/atoms/button"
import { NFIDPersona } from "frontend/modules/persona/types"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({ className }) => {
  const { authorizationRequest, authorizeApp } = useAuthentication()
  const { account } = useAccount()
  const { personas } = usePersona({
    application: authorizationRequest?.hostname,
  })
  const nfidPersonas =
    personas && (personas as NFIDPersona[]).filter((p) => p.persona_id)

  return (
    <IFrameScreen title={account && `Welcome ${account.name}`}>
      <div className="px-6 py-4">
        {nfidPersonas?.map(({ persona_id }) => (
          <Button
            block
            filled
            onClick={() => authorizeApp({ persona_id })}
            className="mt-1"
          >
            Continue as NFID persona {persona_id}
          </Button>
        ))}
      </div>
    </IFrameScreen>
  )
}
