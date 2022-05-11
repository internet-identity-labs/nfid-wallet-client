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
  recoverNFIDPath: string
}

export const AuthenticateDecider: React.FC<AuthenticateDeciderProps> = ({
  rootPath,
  loginUnknownDevicePath,
  loginNFIDPath,
  recoverNFIDPath,
}) => {
  const params = useParams()
  const [query] = useSearchParams()
  const isRootPath = useMatch(rootPath)
  const isRecoverNFIDPath = useMatch(recoverNFIDPath)
  const isLoginUnknownPath = useMatch(loginUnknownDevicePath)
  const isLoginNFIDPath = useMatch(loginNFIDPath)
  console.log(">> ", {
    isRootPath,
    isRecoverNFIDPath,
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
    isLoginNFIDPath,
    isLoginUnknownPath,
    isRecoverNFIDPath,
    isRootPath,
    loginNFIDPath,
    loginUnknownDevicePath,
    navigate,
    params,
    query,
    rootPath,
    userNumber,
  ])

  return <Outlet />
}
