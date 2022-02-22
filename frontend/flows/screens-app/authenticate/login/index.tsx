import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
import { AuthenticateNFIDLoginContent } from "./content"

interface NFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthenticateNFIDLogin: React.FC<NFIDLoginProps> = () => {
  return (
    <AppScreen className="flex flex-col h-full">
      <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
        <AuthenticateNFIDLoginContent />
      </CardBody>
    </AppScreen>
  )
}
