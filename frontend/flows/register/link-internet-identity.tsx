import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  P,
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { RegisterConstants as RC } from "./routes"

interface LocationState {
  iiDeviceLink: string
  userNumber: string
}

interface IdentityPersonaInfoScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterLinkInternetIdentityScreen: React.FC<
  IdentityPersonaInfoScreenProps
> = ({ className }) => {
  const [numDevices, setNumDevices] = React.useState(0)

  const { state } = useLocation()
  const { iiDeviceLink, userNumber } = state as LocationState

  const navigate = useNavigate()

  const handleVisibilityChange = React.useCallback(
    async (e) => {
      const bigUserNumber = BigInt(userNumber)
      const devices = await IIConnection.lookupAll(bigUserNumber)
      if (devices.length > numDevices) {
        navigate(
          `${RC.base}/${RC.linkInternetIdentityCreateAccount}/${userNumber}`,
        )
      }
    },
    [navigate, numDevices, userNumber],
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
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>We're waiting here for you</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P>
            Don't close or refresh this screen. We're waiting here for you to
            finish setting up the new device on Internet Identity.
          </P>
        </CardBody>
        <CardAction bottom className="justify-center">
          <a
            href={iiDeviceLink}
            target="_blank"
            className="flex justify-center"
          >
            <Button block large filled>
              Log in with Internet Identity
            </Button>
          </a>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
