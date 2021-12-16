import { Card, CardBody, IFrame } from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"

interface IFrameOverviewScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameOverviewScreen: React.FC<IFrameOverviewScreenProps> = ({
  children,
  className,
}) => {
  const baseUrl = window.location.origin
  const iframeUrl = (route: string) => {
    return `${baseUrl}/${route}`
  }

  return (
    <AppScreen className={clsx("", className)} title="IFrame overview">
      <Card className={clsx("h-full flex flex-col flex-1", className)}>
        <CardBody className="min-w-full h-full">
          <div className="grid grid-cols-2 gap-6 h-full">
            <IFrame
              title="Authentication"
              src={iframeUrl("authenticate")}
              className="col-span-2 md:col-span-1"
              inline
            />
            <IFrame title="Authentication" src={iframeUrl("authenticate")} />
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
