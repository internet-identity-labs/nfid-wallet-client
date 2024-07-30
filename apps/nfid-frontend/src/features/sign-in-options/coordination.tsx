import { WebAuthnIdentity } from "@dfinity/identity"
import { useActor } from "@xstate/react"
import clsx from "clsx"

import {
  IIAuthCode,
  IIAuthConnect,
  IIAuthEntry,
  Loader,
} from "@nfid-frontend/ui"
import { FrontendDelegation } from "@nfid/integration"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthWithIIActor } from "./machine"
import { IIAuthAddTentativeDevice } from "./pages/add-remote-device"
import { IIAuthRecoveryPhrase } from "./pages/recovery-phrase"

interface AuthWithIICoordinatorProps {
  actor: AuthWithIIActor
}
export function AuthWithIICoordinator({ actor }: AuthWithIICoordinatorProps) {
  const [state, send] = useActor(actor)

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
          onCreateAnchor={() => send({ type: "CREATE_NEW_ANCHOR" })}
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
        <IIAuthAddTentativeDevice
          anchor={state.context?.anchor}
          onCancel={() => send({ type: "BACK" })}
          onSuccess={(data: string) =>
            send({ type: "CONNECT_RETRY", verificationCode: data })
          }
          assignDevice={(data: WebAuthnIdentity) =>
            send({ type: "ASSIGN_USER_DEVICE", data })
          }
          assignDelegation={(data: FrontendDelegation) =>
            send({ type: "ASSIGN_FRONTEND_DELEGATION", data })
          }
        />
      )
    case state.matches("IIConnectAnchorCode"):
    case state.matches("IIConnectAnchorCodeLoading"):
      return (
        <IIAuthCode
          secureCode={state.context?.verificationCode ?? ""}
          anchor={state?.context?.anchor}
          onCancel={() => send({ type: "BACK" })}
          isLoading={state.context.loading ?? false}
        />
      )
    case state.matches("IIThirdParty"):
      return (
        <div className={clsx("relative h-[300px] px-24", "flex items-center")}>
          <Loader isLoading fullscreen={false} />
        </div>
      )
    case state.matches("End"):
    default:
      return <BlurredLoader isLoading />
  }
}
