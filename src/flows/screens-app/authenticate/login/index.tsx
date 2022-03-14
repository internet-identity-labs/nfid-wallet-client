import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
import { NFIDLogin } from "frontend/screens/nfid-login"

interface AppScreenNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AppScreenNFIDLogin: React.FC<AppScreenNFIDLoginProps> = () => (
  <AppScreen className="flex flex-col h-full">
    <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
      <NFIDLogin />
    </CardBody>
  </AppScreen>
)
