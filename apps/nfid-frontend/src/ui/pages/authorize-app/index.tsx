import clsx from "clsx"
import React from "react"

import { SDKApplicationMeta, Tooltip } from "@nfid-frontend/ui"

import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"
import { getAccountDisplayOffset } from "frontend/integration/identity-manager/persona/utils"
import { ElementProps } from "frontend/types/react"
import { Button } from "frontend/ui/atoms/button"
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
    <BlurredLoader
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      className="flex flex-col flex-1"
    >
      <SDKApplicationMeta
        applicationName={applicationName}
        applicationLogo={applicationLogo}
        title="Choose an account"
        subTitle={`to connect to ${applicationName}`}
      />
      <div
        className={clsx("flex flex-col w-full pt-4 space-y-1 relative h-full")}
      >
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
          className={clsx("h-8 flex items-center justify-center space-x-3")}
          onClick={!isAccountsLimit ? onCreateAccount : undefined}
        >
          <div
            className={clsx(
              "hover:opacity-70 transition-all cursor-pointer text-center",
              "text-sm font-semibold",
              isAccountsLimit
                ? "text-secondary pointer-events-none"
                : "text-primaryButtonColor",
              !isAuthenticated && "hidden",
            )}
          >
            Create a new account
          </div>
          {isAccountsLimit && (
            <Tooltip
              tip={`${
                applicationName ?? "The application"
              } has limited the number of free accounts${
                accountsLimit ? ` to ${accountsLimit}` : ""
              }. Manage your accounts from your NFID Profile page.`}
              className="w-72"
            >
              <img src={alertIcon} alt="alert" />
            </Tooltip>
          )}
        </div>
        {!isAuthenticated && (
          <div>
            <BlurOverlay
              className={clsx(
                "w-full h-full",
                "absolute left-0 top-0 bottom-0 right-0 z-10",
                "flex items-end",
              )}
            ></BlurOverlay>
            <Button
              className="relative z-20"
              primary
              large
              onClick={() => onUnlockNFID()}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </BlurredLoader>
  )
}
