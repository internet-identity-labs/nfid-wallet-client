import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"

import { CardBody } from "@nfid/ui"
import { NFIDLogin } from "@nfid/ui/pages/nfid-login"
import { AppScreen } from "@nfid/ui/templates/app-screen/AppScreen"
import { useNFIDNavigate } from "@nfid/ui/utils/use-nfid-navigate"

import { useLoadProfileFromStorage } from "frontend/hooks"

import { useAuthentication } from "../../use-authentication"

interface AppScreenNFIDLoginProps extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
}

export const AppScreenNFIDLogin: React.FC<AppScreenNFIDLoginProps> = ({
  loginSuccessPath,
}) => {
  const { storageProfile, storageProfileLoading } = useLoadProfileFromStorage()
  const { isLoading, login } = useAuthentication()
  const { generatePath } = useNFIDNavigate()
  const navigate = useNavigate()

  const handleLogin = async () => {
    const result = await login()

    if (result.tag === "ok") {
      if (loginSuccessPath) {
        navigate(generatePath(loginSuccessPath))
      }
    }
  }

  return (
    <AppScreen
      className="flex flex-col h-full"
      isFocused
      isLoading={isLoading || storageProfileLoading}
    >
      <main className={clsx("flex flex-1")}>
        <div className="container p-6 mx-auto">
          <CardBody className="flex flex-col-reverse h-full justify-between lg:flex-row lg:justify-between !py-0">
            <NFIDLogin account={storageProfile} onLogin={handleLogin} />
          </CardBody>
        </div>
      </main>
    </AppScreen>
  )
}
