import { Card } from "@internet-identity-labs/nfid-sdk-react"
import { CardBody } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { RecoverNFID } from "frontend/screens/recover-nfid"

interface RestoreAccessPointRecoveryPhraseProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  registerDeviceDeciderPath: string
}

export const AppScreenRecoverNFID: React.FC<
  RestoreAccessPointRecoveryPhraseProps
> = ({ registerDeviceDeciderPath }) => {
  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 lg:col-span-8 xl:col-span-6">
              <RecoverNFID
                registerDeviceDeciderPath={registerDeviceDeciderPath}
              />
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
