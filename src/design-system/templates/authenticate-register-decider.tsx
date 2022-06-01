import React from "react"
import { generatePath, useParams } from "react-router"
import {
  Outlet,
  useMatch,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import { useAccount } from "frontend/services/identity-manager/account/hooks"

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

  React.useEffect(() => {
    if (isRootPath) {
      navigate(
        `${generatePath(
          userNumber ? registeredDevicePath : unknownDevicePath,
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
  ])

  return <Outlet />
}
