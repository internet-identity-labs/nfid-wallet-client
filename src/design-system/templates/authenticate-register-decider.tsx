import React from "react"
import { generatePath, useParams } from "react-router"
import {
  Outlet,
  useMatch,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import { APP_SCREEN_AUTHENTICATE_BASE } from "frontend/apps/authentication/authenticate/constants"
import { PATH_REGISTER } from "frontend/apps/authentication/authenticate/register/path"
import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

interface AuthenticateDeciderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rootPath: string
  unknownDevicePath: string
  registeredDevicePath: string
}

export const AuthenticateRegisterDecider: React.FC<
  AuthenticateDeciderProps
> = ({ rootPath, unknownDevicePath, registeredDevicePath }) => {
  const params = useParams()
  const [query] = useSearchParams()
  const isRootPath = useMatch(rootPath)

  const navigate = useNavigate()

  const { userNumber } = useAccount()

  const { isMobile, isWebAuthNAvailable } = useDeviceInfo()

  React.useEffect(() => {
    const newDevicePath =
      isMobile && isWebAuthNAvailable
        ? `${APP_SCREEN_AUTHENTICATE_BASE}/${PATH_REGISTER}`
        : unknownDevicePath

    if (isRootPath && isWebAuthNAvailable !== undefined) {
      navigate(
        `${generatePath(
          userNumber ? registeredDevicePath : newDevicePath,
          params,
        )}?${query.toString()}`,
      )
    }
  }, [
    isRootPath,
    registeredDevicePath,
    unknownDevicePath,
    navigate,
    params,
    query,
    userNumber,
    isMobile,
    isWebAuthNAvailable,
  ])

  return <Outlet />
}
