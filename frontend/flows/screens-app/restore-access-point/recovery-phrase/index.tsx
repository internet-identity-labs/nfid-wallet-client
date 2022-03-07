import { Card } from "components/molecules/card"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
import { RestoreAccessPointRecoveryPhraseContent } from "./content"

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
          <RestoreAccessPointRecoveryPhraseContent />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
