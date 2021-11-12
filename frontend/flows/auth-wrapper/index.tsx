import clsx from "clsx"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/ii-utils/api-result-to-login-result"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { getUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { Screen } from "frontend/ui-utils/atoms/screen"
import { H2 } from "frontend/ui-utils/atoms/typography"
import React from "react"
import { Register } from "../register"

interface AuthContextState {
  isAuthenticated: boolean
  isLoading: boolean
  connection?: IIConnection
  userNumber?: bigint
  login: () => void
  onRegisterSuccess: (connection: IIConnection) => void
}

export const AuthContext = React.createContext<AuthContextState>({
  isAuthenticated: false,
  isLoading: false,
  connection: undefined,
  userNumber: undefined,
  login: () => console.warn(">> called before initialisation"),
  onRegisterSuccess: () => console.warn(">> called before initialisation"),
})

export const AuthProvider: React.FC = ({ children }) => {
  const [isLoading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<LoginError | null>(null)
  const [connection, setConnection] = React.useState<IIConnection | undefined>(
    undefined,
  )

  const userNumber = React.useMemo(() => getUserNumber(), [])

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
  const { isLoading, isAuthenticated, userNumber, login, onRegisterSuccess } =
    useAuthContext()

  return isAuthenticated ? (
    <>{children}</>
  ) : userNumber ? (
    <Screen>
      <H2>Authenticate</H2>
      <Button onClick={login}>Login</Button>
      <Loader isLoading={isLoading} />
    </Screen>
  ) : (
    <Register onSuccess={onRegisterSuccess} />
  )
}
