import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  Loader,
  P,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { v4 } from "uuid"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

interface CopyLinkToChannelProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CopyLinkToChannel: React.FC<CopyLinkToChannelProps> = () => {
  const [uuid, setUuid] = React.useState("")

  const { createTopic } = usePubSubChannel()

  const setupTopicChannel = React.useCallback(async () => {
    if (!uuid) {
      const uuidv4 = v4()
      const response = await createTopic(uuidv4)
      if (response.status_code !== 200) {
        console.error("Error creating topic channel", { response })
      }
      setUuid(uuidv4)
    }
  }, [createTopic, uuid])

  React.useEffect(() => {
    setupTopicChannel()
  }, [setupTopicChannel])

  const handleCopyUrl = React.useCallback(() => {
    const url = `${window.location.origin}/new-access-point/create-keys/${uuid}`
    if (typeof navigator.share === "function") {
      return navigator.share({ url })
    }
    navigator.clipboard.writeText(url)
  }, [uuid])

  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
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
              {!uuid ? (
                <Loader isLoading={!uuid} />
              ) : (
                <div className="flex flex-col justify-center">
                  <Button
                    large
                    text
                    onClick={() => console.log(">> click")}
                    disabled={!uuid}
                  >
                    show QR Code to scan
                  </Button>
                  <Button
                    large
                    secondary
                    onClick={handleCopyUrl}
                    disabled={!uuid}
                  >
                    copy link
                  </Button>
                </div>
              )}
            </CardAction>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
