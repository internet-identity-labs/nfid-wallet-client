import { Button, H5, P } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"
import ReactTooltip from "react-tooltip"

import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { IFrameTemplate } from "frontend/design-system/templates/IFrameTemplate"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { ElementProps } from "frontend/types/react"

import alertIcon from "./assets/alert-triangle.svg"

import { RawItem } from "./raw-item"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isRemoteAuthorisation?: boolean
  applicationName: string
  applicationLogo: string
  accounts: NFIDPersona[]
  accountsLimit: number
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
  accountsLimit,
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

  const isAccountsLimit = React.useMemo(() => {
    return accounts.length > accountsLimit
  }, [accounts.length, accountsLimit])

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
          className={clsx("h-12 flex items-center justify-between px-[10px]")}
          onClick={handleCreatePersonaAndLogin}
        >
          <div
            className={clsx(
              "flex space-x-3 hover:opacity-70 transition-all cursor-pointer",
              isAccountsLimit
                ? "text-gray-400 pointer-events-none"
                : "text-blue-base",
            )}
          >
            <PlusIcon className="w-5 h-5" />
            <p className="text-sm font-semibold">Create a new account</p>
          </div>
          {isAccountsLimit && (
            <img
              data-tip={`${applicationName} has limited the number of free accounts to ${accountsLimit}. Manage your accounts from your NFID Profile page.`}
              src={alertIcon}
              alt="alert"
            />
          )}
        </div>
        {isAuthenticated && (
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
      <ReactTooltip className="w-72" />
    </IFrameTemplate>
  )
}
