import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { Button, Card, CardBody, H2, P } from "frontend/ui-kit/src"
import React from "react"
import { ImageNFIDLogin } from "./image"

interface NFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onLogin?: () => void
}

export const AuthenticateNFIDLogin: React.FC<NFIDLoginProps> = ({
  children,
  className,
  onLogin: onClick,
}) => {
  const { account } = useAccount()

  return (
    <AppScreen className="flex flex-col h-full">
      <CardBody className="flex flex-col-reverse h-full justify-between py-0 offset-header lg:flex-row lg:justify-between">
        <div>
          <H2 className="my-6">Unlock your NFID</H2>
          <P>
            The NFID on this device can only be unlocked by{" "}
            {account?.name || account?.anchor}.
          </P>
          <Button large secondary className="mt-8" onClick={onClick}>
            Unlock as {account?.name || account?.anchor}
          </Button>
        </div>

        <ImageNFIDLogin />
      </CardBody>
    </AppScreen>
  )
}
