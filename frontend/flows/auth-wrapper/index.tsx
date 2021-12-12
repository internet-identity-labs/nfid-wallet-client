import { useMultipass } from "frontend/hooks/use-multipass"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/utils/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/utils/internet-identity/iiConnection"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Account } from "frontend/modules/account/types"
import {
  Card,
  CardTitle,
  CardBody,
  CardAction,
  Button,
  FaceId,
  Loader,
  Screen,
} from "@identitylabs/ui"

interface AuthContextState {
  isAuthenticated: boolean
  isLoading: boolean
  connection?: IIConnection
  userNumber?: bigint
  account: Account | null
  startUrl: string
  login: () => void
  onRegisterSuccess: (connection: IIConnection) => void
}

export const AuthContext = React.createContext<AuthContextState>({
  isAuthenticated: false,
  isLoading: false,
  connection: undefined,
  userNumber: undefined,
  account: null,
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
        <CardBody className="text-center max-w-lg">
          Use FaceID to sign in
        </CardBody>
        <CardAction className="justify-center items-center">
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
