import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  FaceId,
  Loader,
} from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/utils/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/utils/internet-identity/iiConnection"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import React from "react"
import { Navigate } from "react-router-dom"
import { ActorSubclass } from "@dfinity/agent"
import {
  Account,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/generated/identity_manager"
import { _SERVICE as KeysyncService } from "frontend/modules/keysync/keysync.did"
import { _SERVICE as VaultService } from "frontend/modules/vault/vault.did"
import produce from "immer"

interface Actors {
  connection?: IIConnection
  identityManager?: ActorSubclass<_IDENTITY_MANAGER_SERVICE>
  keysyncActor?: ActorSubclass<KeysyncService>
  vaultActor?: ActorSubclass<VaultService>
}

interface AuthContextState extends Actors {
  isAuthenticated: boolean
  isLoading: boolean
  userNumber?: bigint
  account: Account | undefined
  startUrl: string
  login: () => void
  onRegisterSuccess: (actors: Actors) => void
}

export const AuthContext = React.createContext<AuthContextState>({
  isAuthenticated: false,
  isLoading: false,
  connection: undefined,
  identityManager: undefined,
  keysyncActor: undefined,
  vaultActor: undefined,
  userNumber: undefined,
  account: undefined,
  startUrl: "",
  login: () => console.warn(">> called before initialisation"),
  onRegisterSuccess: () => console.warn(">> called before initialisation"),
})

interface AuthProvider {
  startUrl: string
}

export const AuthProvider: React.FC<AuthProvider> = ({
  children,
  startUrl,
}) => {
  const [isLoading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<LoginError | null>(null)
  const [actors, setActors] = React.useState<Actors>({})
  const { account } = useMultipass()

  const userNumber = React.useMemo(
    () => getUserNumber(account ? account.rootAnchor : null),
    [account],
  )

  const login = React.useCallback(async () => {
    setLoading(true)
    if (!userNumber) {
      throw new Error("register first")
    }
    const response = await IIConnection.login(userNumber)
    const result = apiResultToLoginResult(response)
    if (result.tag === "err") {
      setError(result)
      setLoading(false)
    }
    if (result.tag === "ok") {
      setActors(
        produce(actors, () => ({
          connection: result.connection,
          identityManager: result.identityManager,
          keysyncActor: result.keysyncActor,
          vaultActor: result.vaultActor,
        })),
      )
    }
  }, [actors, userNumber])

  const onRegisterSuccess = React.useCallback(async (actors: Actors) => {
    setActors(actors)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!actors.connection,
        userNumber,
        account,
        startUrl,
        ...actors,
        login,
        onRegisterSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => React.useContext(AuthContext)

export const AuthWrapper: React.FC = ({ children }) => {
  const { isLoading, isAuthenticated, account, login } = useAuthContext()

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
    <Navigate to="/register/welcome" />
  )
}
