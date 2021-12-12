import React from "react"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Button, Card, CardAction, CardBody, CardTitle, P } from "@identitylabs/ui"


interface CopyLinkToChannelProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CopyLinkToChannel: React.FC<CopyLinkToChannelProps> = () => {
  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Link another Access Point?</CardTitle>
        <CardBody className="w-full max-w-xl">
          <P>
            Each Access Point you want to use, needs to be connected to your
            Multipass Account.
          </P>
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <div className="flex flex-col justify-center">
            <Button large text onClick={() => console.log(">> click")}>
              show QR Code to scan
            </Button>
            <Button large filled onClick={() => console.log(">> click")}>
              copy link
            </Button>
          </div>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
