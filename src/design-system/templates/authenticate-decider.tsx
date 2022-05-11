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
  loginUnknownDevicePath: string
  loginNFIDPath: string
}

export const AuthenticateDecider: React.FC<AuthenticateDeciderProps> = ({
  rootPath,
  loginUnknownDevicePath,
  loginNFIDPath,
}) => {
  const params = useParams()
  const [query] = useSearchParams()
  const isRootPath = useMatch(rootPath)
  const isLoginUnknownPath = useMatch(loginUnknownDevicePath)
  const isLoginNFIDPath = useMatch(loginNFIDPath)
  console.log(">> ", {
    isRootPath,
    isLoginUnknownPath,
    isLoginNFIDPath,
  })

  const navigate = useNavigate()

  const { userNumber } = useAccount()

  React.useEffect(() => {
    if (isRootPath) {
      navigate(
        `${generatePath(
          userNumber ? loginNFIDPath : loginUnknownDevicePath,
          params,
        )}?${query.toString()}`,
      )
    }
  }, [
    isRootPath,
    loginNFIDPath,
    loginUnknownDevicePath,
    navigate,
    params,
    query,
    userNumber,
  ])

  return <Outlet />
}
