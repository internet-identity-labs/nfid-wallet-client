import { AppScreen } from "frontend/design-system/templates/AppScreen"
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
  return (
    <AppScreen classNameWrapper="mt-auto lg:mt-0 flex flex-col h-full">
      <Card>
        <CardBody className="offset-header flex lg:flex-row lg:justify-between flex-col-reverse justify-between py-0">
          <div>
            <H2 className="my-6">Your NFID profile</H2>
            <P>
              The NFID on this access point can only be unlocked by{" "}
              {"accountName"}.
            </P>
            <Button large secondary className="mt-8" onClick={onClick}>
              Unlock NFID
            </Button>
          </div>

          <ImageNFIDLogin />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
