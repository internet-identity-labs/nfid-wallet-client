import clsx from "clsx"
import { useMultipass } from "frontend/hooks/use-multipass"
import {
  apiResultToLoginResult,
  LoginError,
} from "frontend/utils/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/utils/internet-identity/iiConnection"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import { Account } from "frontend/modules/account/types"
import { Button } from "frontend/design-system/atoms/button"
import { FaceId } from "frontend/design-system/atoms/images/face-id"
import { Loader } from "frontend/design-system/atoms/loader"
import { Screen } from "frontend/design-system/atoms/screen"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Navigate, useLocation } from "react-router-dom"

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
    <AppScreen>
      <Screen className={clsx("p-7 py-10")}>
        <h1 className={clsx("font-bold text-3xl")}>Multipass</h1>
        <div className={clsx("flex-grow")} />
        <p className="font-medium text-center my-5">
          You need to authenticate to use this app.
        </p>
        <Button
          className={clsx("flex flex-row w-full justify-start items-center")}
          onClick={login}
        >
          <div className={clsx("p-2 bg-gray-200")}>
            <FaceId />
          </div>
          <div className="ml-1 p-2 align-middle">Login using Face ID</div>
        </Button>
        <Loader isLoading={isLoading} />
      </Screen>
    </AppScreen>
  ) : (
    <Navigate to="/register-identity-persona-welcome" />
  )
}
