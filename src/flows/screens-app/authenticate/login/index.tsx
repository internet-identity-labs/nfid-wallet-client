import { CardBody } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { NFIDLogin } from "frontend/screens/nfid-login"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"

interface AppScreenNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLoginSuccess?: (loginResult: void | LoginSuccess) => void
}

export const AppScreenNFIDLogin: React.FC<AppScreenNFIDLoginProps> = ({
  onLoginSuccess,
}) => (
  <AppScreen className="flex flex-col h-full" isFocused>
    <main className={clsx("flex flex-1")}>
      <div className="container p-6 mx-auto">
        <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
          <NFIDLogin onLoginSuccess={onLoginSuccess} />
        </CardBody>
      </div>
    </main>
  </AppScreen>
)
