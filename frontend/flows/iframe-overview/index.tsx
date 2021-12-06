import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card } from "frontend/design-system/molecules/card"
import { IFrame } from "frontend/design-system/molecules/iframe"
import { H1, H3, H4 } from "frontend/design-system/atoms/typography"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { Divider } from "frontend/design-system/atoms/divider"
import { CardBody } from "frontend/design-system/molecules/card/body"

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
