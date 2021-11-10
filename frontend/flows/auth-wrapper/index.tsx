import clsx from "clsx"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/ii-utils/api-result-to-login-result"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { getUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Loader } from "frontend/ui-utils/atoms/loader"
import React from "react"

interface AuthContextState {
  isAuthenticated: boolean
  isLoading: boolean
  connection?: IIConnection
  userNumber?: bigint
  login: () => void
  register: () => void
}

export const AuthContext = React.createContext<AuthContextState>({
  isAuthenticated: false,
  isLoading: false,
  connection: undefined,
  userNumber: undefined,
  login: () => console.warn(">> called before initialisation"),
  register: () => console.warn(">> called before initialisation"),
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

  const register = React.useCallback(async () => {
    console.log(">> not yet implemented")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!connection,
        userNumber,
        connection,
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => React.useContext(AuthContext)

export const AuthWrapper: React.FC = ({ children }) => {
  const { isLoading, isAuthenticated, userNumber, login, register } =
    useAuthContext()
  console.log(">> ", { isAuthenticated })

  return isAuthenticated ? (
    <>{children}</>
  ) : userNumber ? (
    <div className={clsx("flex flex-col")}>
      <div>You need to be authenticated</div>
      <Button onClick={login}>Login</Button>
      <Loader isLoading={isLoading} />
    </div>
  ) : (
    <div className={clsx("flex flex-col")}>
      <div>You need to register</div>
      <Button onClick={register}>Login</Button>
      <Loader isLoading={isLoading} />
    </div>
  )
}
