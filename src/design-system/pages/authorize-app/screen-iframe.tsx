import React from "react"

import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

import { NFIDPersona } from "frontend/comm/services/identity-manager/persona/types"
import { ElementProps } from "frontend/types/react"

import { AuthorizeApp } from "."

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  applicationName: string
  applicationLogo: string
  accounts: NFIDPersona[]
  accountsLimit?: number
  isLoading: boolean
  isAuthenticated: boolean
  onLogin: (personaId?: string) => Promise<void>
  onUnlockNFID: () => Promise<any>
  onCreateAccount: () => Promise<void>
}

export const AuthorizeAppIframe: React.FC<AuthorizeAppProps> = ({
  accounts,
  accountsLimit,
  applicationLogo,
  applicationName,
  isAuthenticated,
  isLoading,
  onCreateAccount,
  onUnlockNFID,
  onLogin,
}) => {
  return (
    <ScreenResponsive
      isLoading={isLoading}
      loadingMessage=""
      className="flex flex-col items-center"
    >
      <AuthorizeApp
        accounts={accounts}
        accountsLimit={accountsLimit}
        applicationLogo={applicationLogo}
        applicationName={applicationName}
        isAuthenticated={isAuthenticated}
        onCreateAccount={onCreateAccount}
        onLogin={onLogin}
        onUnlockNFID={onUnlockNFID}
      />
    </ScreenResponsive>
  )
}
