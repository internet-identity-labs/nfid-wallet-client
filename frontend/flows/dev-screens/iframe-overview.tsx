import clsx from "clsx"
import { IFrameWrapper } from "components/molecules/iframe/wrapper"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { Button, Card, CardBody, H5, P } from "frontend/ui-kit/src"
import React from "react"

interface IFrameOverviewProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameOverview: React.FC<IFrameOverviewProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen className={clsx("", className)}>
      <Card>
        <CardBody>
          <div className="grid grid-cols-12 gap-x-4 gap-y-12 grid-flow-row">
            {Array.from({ length: 3}, (_, i) => (
              <IFrameWrapper
                className="inset-0 col-span-4 relative"
                fixedHeight={false}
              >
                <IFrameScreen>
                  <H5 className="mb-4 text-center">Welcome</H5>
                  <P>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ducimus, possimus. Odit, veniam tempora maiores architecto
                    quia.
                  </P>
                  <Button secondary block>
                    Next
                  </Button>
                </IFrameScreen>
              </IFrameWrapper>
            ))}
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
