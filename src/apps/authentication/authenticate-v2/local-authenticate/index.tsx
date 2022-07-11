import { useMachine } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthorizeMultiAccount } from "frontend/design-system/pages/authorize-app/multi-account"
import { AuthorizeAppSingleAccount } from "frontend/design-system/pages/authorize-app/single-account"

import { machine } from "./machine"

export const Authenticate: React.FC = () => {
  const [{ value }] = useMachine(machine)

  console.log(">> Authenticate", { value })
  switch (value) {
    case "AuthorizeSingleAccountApplication":
      return (
        <AuthorizeAppSingleAccount
          onContinueButtonClick={function (): Promise<void> {
            throw new Error("Function not implemented.")
          }}
        />
      )
    case "AuthorizeMultiAccountApplication":
      return (
        <AuthorizeMultiAccount
          applicationName={""}
          applicationLogo={""}
          accounts={[]}
          isLoading={false}
          isAuthenticated={false}
          onLogin={function (personaId?: string | undefined): Promise<void> {
            throw new Error("Function not implemented.")
          }}
          onUnlockNFID={function (): Promise<any> {
            throw new Error("Function not implemented.")
          }}
          onCreateAccount={function (): Promise<void> {
            throw new Error("Function not implemented.")
          }}
        />
      )
    default:
      return <Loader isLoading />
  }
}
