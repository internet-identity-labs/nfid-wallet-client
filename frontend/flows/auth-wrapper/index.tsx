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
import { useMultipass } from "frontend/hooks/use-multipass"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import React from "react"
import { Navigate } from "react-router-dom"
import { ActorSubclass } from "@dfinity/agent"
import {
  AccountResponse,
  _SERVICE as _IDENTITY_MANAGER_SERVICE,
} from "frontend/services/identity-manager/identity_manager"

interface AuthContextState {
  isAuthenticated: boolean
  isLoading: boolean
  connection?: IIConnection
  identityManager?: ActorSubclass<_IDENTITY_MANAGER_SERVICE>
  userNumber?: bigint
  account: AccountResponse | undefined
  startUrl: string
  login: () => void
  onRegisterSuccess: (connection: IIConnection) => void
}

export const AuthContext = React.createContext<AuthContextState>({
  isAuthenticated: false,
  isLoading: false,
  connection: undefined,
  identityManager: undefined,
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
  const [connection, setConnection] = React.useState<IIConnection | undefined>(
    undefined,
  )
  const [identityManager, setIdentityManager] = React.useState<
    ActorSubclass<_IDENTITY_MANAGER_SERVICE> | undefined
  >(undefined)
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
      setConnection(result.connection)
      setIdentityManager(result.identityManager)
    }
  }, [userNumber])

  const onRegisterSuccess = React.useCallback(
    async (connection: IIConnection) => {
      setConnection(connection)
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!connection,
        userNumber,
        connection,
        identityManager,
        account,
        startUrl,
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
    <Navigate to="/register-account" />
  )
}
