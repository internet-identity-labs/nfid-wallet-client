import React from "react"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Button, Card, CardAction, CardBody, CardTitle, Loader, P } from "@identity-labs/ui"
import { v4 } from "uuid"
import { useMultipass } from "frontend/hooks/use-multipass"

interface CopyLinkToChannelProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CopyLinkToChannel: React.FC<CopyLinkToChannelProps> = () => {
  const [uuid, setUuid] = React.useState("")

  const { createTopic } = useMultipass()

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
              <Button large filled onClick={handleCopyUrl} disabled={!uuid}>
                copy link
              </Button>
            </div>
          )}
        </CardAction>
      </Card>
    </AppScreen>
  )
}
