import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { RestoreAccessPoint } from "frontend/screens/restore-access-point"
import { CardBody } from "frontend/ui-kit/src"

import { Card } from "components/molecules/card"

interface RestoreAccessPointRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RestoreAccessPointRecoveryPhrase: React.FC<
  RestoreAccessPointRecoveryPhraseProps
> = ({ children, className }) => {
  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 lg:col-span-8 xl:col-span-6">
          <RestoreAccessPoint />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
