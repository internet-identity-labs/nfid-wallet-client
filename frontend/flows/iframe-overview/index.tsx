import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { Card } from "frontend/ui-utils/molecules/card"
import { IFrame } from "frontend/ui-utils/molecules/iframe"
import { H1, H3, H4 } from "frontend/ui-utils/atoms/typography"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { Divider } from "frontend/ui-utils/atoms/divider"
import { CardBody } from "frontend/ui-utils/molecules/card/body"

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
    <AppScreen className={clsx("", className)}>
      <Card className={clsx("h-full flex flex-col flex-1", className)}>
        <CardTitle>IFrame overview</CardTitle>

        <Divider />

        <CardBody className="min-w-full h-full">
          <div className="grid grid-cols-2 gap-6 h-full ">
            <IFrame
              title="Authentication"
              src={iframeUrl("authenticate")}
              className="min-h-[300px] col-span-2 md:col-span-1"
              inline
            />
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
