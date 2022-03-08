import { Card } from "components/molecules/card"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
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
