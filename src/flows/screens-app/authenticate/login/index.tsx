import { CardBody } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { NFIDLogin } from "frontend/screens/nfid-login"

interface AppScreenNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AppScreenNFIDLogin: React.FC<AppScreenNFIDLoginProps> = () => (
  <AppScreen className="flex flex-col h-full" isFocused>
    <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
      <NFIDLogin />
    </CardBody>
  </AppScreen>
)
