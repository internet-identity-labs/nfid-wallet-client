import clsx from "clsx"
import React from "react"
import ReactTooltip from "react-tooltip"

import { Button } from "frontend/design-system/atoms/button"
import { PlusIcon } from "frontend/design-system/atoms/icons/plus"
import { H5 } from "frontend/design-system/atoms/typography"
import { P } from "frontend/design-system/atoms/typography/paragraph"

import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { ElementProps } from "frontend/types/react"

import alertIcon from "./assets/alert-triangle.svg"

import { AccountItem } from "./raw-item"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isAuthenticated: boolean
  applicationName: string
  applicationLogo?: string
  accounts: NFIDPersona[]
  accountsLimit?: number
  onUnlockNFID: () => Promise<any>
  onLogin: (personaId: string) => Promise<void>
  onCreateAccount: () => Promise<void>
}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({
  isAuthenticated,
  applicationName,
  applicationLogo,
  accounts,
  accountsLimit,
  onUnlockNFID,
  onLogin,
  onCreateAccount,
}) => {
  const isAccountsLimit = React.useMemo(() => {
    return accountsLimit && accounts.length > --accountsLimit
  }, [accounts.length, accountsLimit])

  return (
    <>
      {applicationLogo && <img src={applicationLogo} alt="logo" />}
      <H5 className="mt-4">Choose an account</H5>
      <P className="mt-2">to continue to {applicationName}</P>
      <div className={clsx("flex flex-col w-full mt-4 space-y-1 relative")}>
        {accounts.map((account) => {
          return (
            <AccountItem
              title={`${applicationName} account ${account.persona_id}`}
              onClick={() => onLogin(account.persona_id)}
            />
          )
        })}
        <div
          className={clsx("h-12 flex items-center justify-between px-[10px]")}
          onClick={onCreateAccount}
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
        {!isAuthenticated && (
          <div
            className={clsx(
              "w-full h-full absolute left-0 top-0 z-10",
              "backdrop-blur-sm bg-white bg-opacity-10",
              "flex justify-center items-center",
            )}
          >
            <Button secondary large onClick={() => onUnlockNFID()}>
              Unlock NFID
            </Button>
          </div>
        )}
      </div>
      <ReactTooltip className="w-72" />
    </>
  )
}
