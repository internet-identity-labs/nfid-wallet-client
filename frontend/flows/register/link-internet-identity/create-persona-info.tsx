import React from "react"
import clsx from "clsx"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { P } from "frontend/design-system/atoms/typography/paragraph"
import { useLocation, useNavigate } from "react-router-dom"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { IIConnection } from "frontend/utils/internet-identity/iiConnection"
import { AuthContext, useAuthContext } from "frontend/flows/auth-wrapper"
import { useMultipass } from "frontend/hooks/use-multipass"

interface IdentityPersonaInfoScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaInfoScreen: React.FC<
  IdentityPersonaInfoScreenProps
> = ({ className }) => {
  const [numDevices, setNumDevices] = React.useState(0)

  const { updateAccount } = useMultipass()

  const {
    state: { iiDeviceLink, userNumber },
  } = useLocation()
  const navigate = useNavigate()

  const handleVisibilityChange = React.useCallback(
    async (e) => {
      const devices = await IIConnection.lookupAll(BigInt(userNumber))
      updateAccount({
        rootAnchor: userNumber.toString(),
      })
      if (devices.length > numDevices) {
        navigate("/register-identity-persona-success")
      }
    },
    [navigate, numDevices, updateAccount, userNumber],
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
