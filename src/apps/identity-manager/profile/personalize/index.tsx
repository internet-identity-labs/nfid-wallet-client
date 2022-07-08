import { Card, CardBody } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/app-screen/AppScreen"

import { NFIDPersonalizeContent } from "./content"

interface NFIDPersonalizeProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
  > { }

export const NFIDPersonalize: React.FC<NFIDPersonalizeProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
              <NFIDPersonalizeContent />
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
