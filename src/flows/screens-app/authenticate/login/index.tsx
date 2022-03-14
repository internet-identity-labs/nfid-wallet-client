import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
import { NFIDLogin } from "frontend/screens/nfid-login"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

interface NFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const AuthenticateNFIDLogin: React.FC<NFIDLoginProps> = (
  { iframe } = { iframe: false },
) => {
  console.log(">> AuthenticateNFIDLogin", { iframe })

  return iframe ? (
    <IFrameScreen logo className="flex flex-col h-full">
      <NFIDLogin />
    </IFrameScreen>
  ) : (
    <AppScreen className="flex flex-col h-full">
      <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
        <NFIDLogin />
      </CardBody>
    </AppScreen>
  )
}
