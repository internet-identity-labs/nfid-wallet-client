import { Card } from "@identity-labs/nfid-sdk-react"
import { CardBody } from "@identity-labs/nfid-sdk-react"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { NFIDPersonalizeContent } from "./content"

interface NFIDPersonalizeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const NFIDPersonalize: React.FC<NFIDPersonalizeProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
          <NFIDPersonalizeContent />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
