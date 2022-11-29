import { useActor } from "@xstate/react"

import {
  IIAuthCode,
  IIAuthComplete,
  IIAuthConnect,
  IIAuthEntry,
} from "@nfid-frontend/ui"

import { IIAuthRecoveryPhrase } from "frontend/apps/authentication/auth-ii/recovery-phrase"
import { AuthWithIIActor } from "frontend/state/machines/authentication/auth-with-ii"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

interface AuthWithIICoordinatorProps {
  actor: AuthWithIIActor
}
export function AuthWithIICoordinator({ actor }: AuthWithIICoordinatorProps) {
  const [state, send] = useActor(actor)

  console.debug("AuthWithIICoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("InitAuthWithII"):
      return (
        <IIAuthEntry
          applicationName={state.context?.appMeta?.name}
          applicationLogo={state.context?.appMeta?.logo}
          onBack={() => {
            send({ type: "BACK" })
          }}
          onContinue={(signType: "new_nfid" | "existing_nfid") => {
            if (signType === "existing_nfid") send({ type: "EXISTING_NFID" })
            else send({ type: "NEW_NFID" })
          }}
        />
      )
    case state.matches("IICreateNewNFID"):
      return (
        <IIAuthConnect
          onBack={() => send({ type: "BACK" })}
          onRecovery={() =>
            send({
              type: "CONNECT_WITH_RECOVERY",
            })
          }
          onCreateAnchor={() => send({ type: "EXISTING_NFID" })}
          onConnect={(anchor: number) =>
            send({ type: "CONNECT_WITH_ANCHOR", anchor: anchor })
          }
        />
      )
    case state.matches("IIRecoveryPhrase"):
      return (
        <IIAuthRecoveryPhrase
          onBack={() => send({ type: "BACK" })}
          onSuccess={(authSession) =>
            send({ type: "RECOVER_II_SUCCESS", data: authSession })
          }
        />
      )
    case state.matches("IIConnectAnchor"):
      return (
        <IIAuthComplete
          anchor={state.context?.anchor}
          onCancel={() => send({ type: "BACK" })}
          onRetry={() => send({ type: "CONNECT_RETRY" })}
        />
      )
    case state.matches("IIConnectAnchorCode"):
      return (
        <IIAuthCode
          secureCode={"123456"}
          anchor={state?.context?.anchor}
          onCancel={() => send({ type: "BACK" })}
        />
      )
    case state.matches("End"):
    default:
      return <BlurredLoader isLoading />
  }
}
