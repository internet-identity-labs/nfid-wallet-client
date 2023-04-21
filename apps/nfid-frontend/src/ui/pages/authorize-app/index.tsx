import clsx from "clsx"
import React from "react"

import { BlurOverlay, Button, SDKApplicationMeta } from "@nfid-frontend/ui"
import { Image } from "@nfid-frontend/ui"

import dfinity from "frontend/assets/dfinity.svg"
import { ChooseAccount } from "frontend/features/embed-connect-account/ui/choose-account/choose-account"
import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"
import { getAccountDisplayOffset } from "frontend/integration/identity-manager/persona/utils"
import { ElementProps } from "frontend/types/react"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import MobileHero from "./assets/mobile_hero.svg"

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
  const [selectedPersonaID, setSelectedAccount] = React.useState<
    string | null
  >()
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

  const accountsOptions = React.useMemo(() => {
    return [
      {
        label: "Anonymous",
        options: accounts.map((acc) => ({
          title: applicationName
            ? `${applicationName} account ${
                Number(acc.persona_id) + accountOffset
              }`
            : `Account ${Number(acc.persona_id) + accountOffset}`,
          value: acc.persona_id,
          icon: dfinity,
        })),
      },
    ]
  }, [accountOffset, accounts, applicationName])

  return (
    <BlurredLoader
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      className="flex flex-col flex-1"
    >
      <ChooseAccount
        appMeta={{
          logo: applicationLogo,
          name: applicationName,
          url: applicationName,
        }}
        accounts={accountsOptions}
        onConnect={() => onLogin(selectedPersonaID ?? accounts[0].persona_id)}
        onSelectAccount={(value) => setSelectedAccount(value)}
        onConnectAnonymously={onCreateAccount}
        accountsLimitMessage={
          isAccountsLimit
            ? `${applicationName} has limited the number of free accounts to ${accountsLimit}. Manage your accounts from your NFID Profile page.`
            : undefined
        }
      />
      {!isAuthenticated && (
        <div>
          <BlurOverlay
            className={clsx(
              "w-full h-full p-5",
              "absolute left-0 top-0 bottom-0 right-0 z-10",
              "flex flex-col justify-between",
            )}
          >
            <div>
              <SDKApplicationMeta
                applicationLogo={applicationLogo}
                applicationName={applicationName}
                title="Unlock your NFID"
                subTitle={`to connect to ${applicationName}`}
              />
              <Image className="w-full max-w-max" src={MobileHero} alt="" />
            </div>
            <Button
              className="relative z-20"
              type="primary"
              block
              onClick={() => onUnlockNFID()}
            >
              Unlock to continue
            </Button>
          </BlurOverlay>
        </div>
      )}
    </BlurredLoader>
  )
}
