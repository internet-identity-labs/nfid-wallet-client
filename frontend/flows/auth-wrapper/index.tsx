import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  FaceId,
  Loader,
} from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import React from "react"
import { Navigate } from "react-router-dom"
import { atom, useAtom } from "jotai"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { ActorSubclass } from "@dfinity/agent"
import { _SERVICE as IdentityManagerService } from "frontend/services/identity-manager/identity_manager"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"

interface Actors {
  internetIdentity: IIConnection
  identityManager: ActorSubclass<IdentityManagerService>
  pubsubChannelActor: ActorSubclass<PubsubChannelService>
}

const errorAtom = atom<any | null>(null)
const loadingAtom = atom<boolean>(false)
const actorsAtom = atom<Actors | null>(null)
const isAuthenticatedAtom = atom((get) => get(actorsAtom) !== null)

export const useAuthentication = () => {
  const [error, setError] = useAtom(errorAtom)
  const [isAuthenticated] = useAtom(isAuthenticatedAtom)
  const [isLoading, setIsLoading] = useAtom(loadingAtom)
  const [actors, setActors] = useAtom(actorsAtom)

  const { userNumber } = useAccount()

  const login = React.useCallback(async () => {
    setIsLoading(true)
    if (!userNumber) {
      throw new Error("register first")
    }
    const response = await IIConnection.login(userNumber)
    const result = apiResultToLoginResult(response)
    if (result.tag === "err") {
      setError(result)
      setIsLoading(false)
    }
    if (result.tag === "ok") {
      setActors(result)
    }
  }, [setActors, setError, setIsLoading, userNumber])

  const onRegisterSuccess = React.useCallback(
    (actors) => {
      setActors(actors)
    },
    [setActors],
  )

  return {
    isLoading,
    isAuthenticated,
    internetIdentity: actors?.internetIdentity,
    identityManager: actors?.identityManager,
    pubsubChannel: actors?.pubsubChannelActor,
    login,
    onRegisterSuccess,
  }
}

export const AuthWrapper: React.FC = ({ children }) => {
  const { isLoading, isAuthenticated, login } = useAuthentication()
  const { account } = useAccount()

  return isAuthenticated ? (
    <>{children}</>
  ) : account ? (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Login</CardTitle>
        <CardBody className="max-w-lg text-center">
          Use FaceID to sign in
        </CardBody>
        <CardAction className="items-center justify-center">
          <Button onClick={login}>
            <FaceId />
          </Button>
        </CardAction>
        <Loader isLoading={isLoading} />
      </Card>
    </AppScreen>
  ) : (
    <Navigate to="/register-account" />
  )
}
