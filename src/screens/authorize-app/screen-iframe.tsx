import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import { DropdownMenu } from "@internet-identity-labs/nfid-sdk-react"
import { Label, Loader, MenuItem } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"

import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { P } from "frontend/design-system/atoms/typography/paragraph"
import { List } from "frontend/design-system/molecules/list"
import { ListItem } from "frontend/design-system/molecules/list/list-item"
import { IFrameTemplate } from "frontend/design-system/templates/IFrameTemplate"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { ElementProps } from "frontend/types/react"

import { RawItem } from "./raw-item"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isRemoteAuthorisation?: boolean
  applicationName: string
  applicationLogo: string
  accounts: NFIDPersona[]
  onLogin: (personaId: string) => Promise<void>
  onCreateAccount: () => Promise<void>
}

export const AuthorizeAppIframe: React.FC<AuthorizeAppProps> = ({
  isRemoteAuthorisation,
  applicationName,
  applicationLogo,
  accounts,
  onLogin,
  onCreateAccount,
}) => {
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuthentication()

  const handleLogin = React.useCallback(
    async (account) => {
      setLoading(true)
      await onLogin(account)
      setLoading(false)
    },
    [onLogin],
  )

  const handleCreatePersonaAndLogin = React.useCallback(async () => {
    setLoading(true)
    await onCreateAccount()
    setLoading(false)
  }, [onCreateAccount])

  return (
    <IFrameTemplate
      isLoading={loading}
      loadingMessage=""
      className="flex flex-col items-center"
    >
      <img src={applicationLogo} alt="logo" />
      <H5 className="mt-4">Choose an account</H5>
      <P className="mt-2">to continue to {applicationName}</P>
      <div className={clsx("flex flex-col w-full mt-4 space-y-1 relative")}>
        {accounts.map((account) => {
          return (
            <RawItem
              title={`${applicationName} account ${account.persona_id}`}
              onClick={() => handleLogin(account)}
            />
          )
        })}
        <div
          className={clsx(
            "h-12 hover:opacity-70 transition-all cursor-pointer",
            "flex items-center px-[10px] text-blue-base space-x-3",
          )}
          onClick={handleCreatePersonaAndLogin}
        >
          <PlusIcon className="w-5 h-5" />
          <p className="text-sm font-semibold">Create a new account</p>
        </div>
        {!isAuthenticated && (
          <div
            className={clsx(
              "w-full h-full absolute left-0 top-0 z-10",
              "backdrop-blur-sm bg-white bg-opacity-10",
              "flex justify-center items-center",
            )}
          >
            <Button secondary large onClick={() => login()}>
              Unlock NFID
            </Button>
          </div>
        )}
      </div>
    </IFrameTemplate>
  )
}
