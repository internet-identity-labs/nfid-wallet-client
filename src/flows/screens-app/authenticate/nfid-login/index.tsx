import clsx from "clsx"
import React from "react"

import { CardBody } from "@internet-identity-labs/nfid-sdk-react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { NFIDLogin } from "frontend/screens/nfid-login"

interface AppScreenNFIDLoginProps extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
}

export const AppScreenNFIDLogin: React.FC<AppScreenNFIDLoginProps> = ({
  loginSuccessPath,
}) => {
  return (
    <AppScreen className="flex flex-col h-full" isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container p-6 mx-auto">
          <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
            <NFIDLogin loginSuccessPath={loginSuccessPath} />
          </CardBody>
        </div>
      </main>
    </AppScreen>
  )
}
