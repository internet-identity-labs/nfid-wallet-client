import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { Button, Card, CardBody, H2, Modal, P } from "frontend/ui-kit/src/index"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom"

interface LocationState {
  iiDeviceLink: string
  userNumber: string
}

interface LinkIIAnchorKeysProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkIIAnchorKeys: React.FC<LinkIIAnchorKeysProps> = ({
  className,
}) => {
  const [showModal, setShowModal] = React.useState(false)
  const [numDevices, setNumDevices] = React.useState(0)

  const { state } = useLocation()
  const { account, updateAccount } = useMultipass()
  const navigate = useNavigate()

  const { iiDeviceLink, userNumber } = state as LocationState

  const handleVisibilityChange = React.useCallback(
    async (e) => {
      const bigUserNumber = BigInt(userNumber)
      const devices = await IIConnection.lookupAll(bigUserNumber)

      if (devices.length > numDevices) {
        if (!account) throw new Error("No account found")

        account.iiAnchors = [
          ...(account.iiAnchors || []),
          userNumber.toString(),
        ]

        updateAccount(account)
        setShowModal(true)
      }
    },
    [account, numDevices, updateAccount, userNumber],
  )

  const fetchDevices = React.useCallback(async () => {
    const devices = await IIConnection.lookupAll(BigInt(userNumber))
    setNumDevices(devices.length)
    return devices
  }, [userNumber])

  React.useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  React.useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [handleVisibilityChange])

  return (
    <AppScreen>
      <Card className="offset-header grid grid-cols-12">
        <CardBody className="col-span-12 lg:col-span-8 xl:col-span-6">
          <H2 className="my-4">Link anchor {"anchorNumber"}</H2>

          <P className="mb-3">
            Log in to Internet Identity with anchor {userNumber} to complete the
            linking.
          </P>

          <P>
            <span className="font-bold">Do not</span> close or refresh this
            screen.
          </P>

          <a href={iiDeviceLink} target="_blank" className="block my-6">
            <Button filled largeMax>
              Log in with Internet Identity
            </Button>
          </a>
        </CardBody>
      </Card>
      {showModal ? (
        <Modal
          title={"Great job!"}
          description="You signed in to {applicationName}"
          buttonText="Done"
          onClick={() => {
            setShowModal(false)
            navigate("/")
          }}
        />
      ) : null}
    </AppScreen>
  )
}
