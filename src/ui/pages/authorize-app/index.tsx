import clsx from "clsx"
import React from "react"
import ReactTooltip from "react-tooltip"

import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"
import { getAccountDisplayOffset } from "frontend/integration/identity-manager/persona/utils"
import { ElementProps } from "frontend/types/react"
import { Button } from "frontend/ui/atoms/button"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { ApplicationMeta } from "frontend/ui/molecules/application-meta"
import { BlurOverlay } from "frontend/ui/molecules/blur-overlay"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import alertIcon from "./assets/alert-triangle.svg"

import { AccountItem } from "./raw-item"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isAuthenticated?: boolean
  applicationName?: string
  applicationLogo?: string
  accounts: NFIDPersona[]
  accountsLimit?: number
  isLoading?: boolean
  loadingMessage?: string | boolean
  onUnlockNFID: () => Promise<any>
  onLogin: (accountId: string) => Promise<void>
  onCreateAccount: () => Promise<void>
}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({
  isAuthenticated,
  applicationName,
  applicationLogo,
  accounts,
  accountsLimit,
  isLoading,
  loadingMessage,
  onUnlockNFID,
  onLogin,
  onCreateAccount,
}) => {
  console.debug("AuthorizeApp", {
    isAuthenticated,
    applicationName,
    applicationLogo,
    accounts,
    accountsLimit,
  })

  const accountOffset = React.useMemo(
    () => getAccountDisplayOffset(accounts),
    [accounts],
  )

  const isAccountsLimit = React.useMemo(() => {
    return accountsLimit && accounts.length >= accountsLimit
  }, [accounts.length, accountsLimit])

  const displayAccounts = isAuthenticated
    ? accounts
    : // FAKE DISPLAY DATA FOR BLURRED BACKGROUND
      new Array(4).fill(null).map((_, i) => ({
        domain: "http://fake.com",
        persona_id: i === 0 ? "longer" : `${i}`,
      }))

  return (
    <BlurredLoader isLoading={isLoading} loadingMessage={loadingMessage}>
      <ApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Choose an account"
        subTitle={`to continue ${applicationName && `to ${applicationName}`}`}
      />
      <div className={clsx("flex flex-col w-full pt-4 space-y-1 relative")}>
        {displayAccounts.map((account, i) => {
          return (
            <AccountItem
              title={
                applicationName
                  ? `${applicationName} account ${
                      Number(account.persona_id) + accountOffset
                    }`
                  : `Account ${Number(account.persona_id) + accountOffset}`
              }
              onClick={() => onLogin(account.persona_id)}
              key={`account${account.persona_id}${i}`}
            />
          )
        })}
        <div
          className={clsx("h-12 flex items-center justify-between px-[10px]")}
          onClick={!isAccountsLimit ? onCreateAccount : undefined}
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
            <>
              <img
                data-tip={`${
                  applicationName ?? "The application"
                } has limited the number of free accounts${
                  accountsLimit ? ` to ${accountsLimit}` : ""
                }. Manage your accounts from your NFID Profile page.`}
                src={alertIcon}
                alt="alert"
              />
              <ReactTooltip className="w-72" />
            </>
          )}
        </div>
        {!isAuthenticated && (
          <BlurOverlay
            className={clsx(
              "-m-4 p-4",
              "absolute left-0 top-0 bottom-0 right-0 z-10",
              "flex justify-center items-center",
            )}
          >
            <Button
              className={clsx("mt-[520px]")}
              primary
              large
              onClick={() => onUnlockNFID()}
            >
              Unlock NFID
            </Button>
          </BlurOverlay>
        )}
      </div>
    </BlurredLoader>
  )
}
