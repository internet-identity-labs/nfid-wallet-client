import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { generatePath } from "react-router-dom"

import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useMultipass } from "frontend/hooks/use-multipass"
import { RegisterAccountIntro } from "frontend/screens/register-account-intro/screen-app"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  captchaPath: string
}

export const RouteRegisterAccountIntro: React.FC<RegisterAccountIntroProps> = ({
  captchaPath,
}) => {
  const { secret, scope } = useParams()

  const { isLoading, setIsloading } = useIsLoading()
  const navigate = useNavigate()
  const { applicationName, createWebAuthNIdentity } = useMultipass()

  const handleCreateKeys = React.useCallback(async () => {
    setIsloading(true)
    const registerPayload = await createWebAuthNIdentity()

    // TODO: fix url
    const path = generatePath(captchaPath, {
      secret,
      scope,
    })

    navigate(path, {
      state: {
        registerPayload,
      },
    })
    setIsloading(false)
  }, [
    captchaPath,
    createWebAuthNIdentity,
    navigate,
    scope,
    secret,
    setIsloading,
  ])

  return (
    <RegisterAccountIntro
      isLoading={isLoading}
      applicationName={applicationName}
      onRegister={handleCreateKeys}
      onRecover={() => console.log(">> implement me")}
    />
  )
}
