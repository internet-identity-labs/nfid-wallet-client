import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card, CardTitle, CardAction, Button } from "frontend/ui-kit/src/index"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { useNavigate, useParams } from "react-router-dom"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { useMultipass } from "frontend/hooks/use-multipass"
import { RegisterConstants as RC } from "./routes"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface LinkInternetIdentityCreateAccountScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkInternetIdentityCreateAccountScreen: React.FC<
  LinkInternetIdentityCreateAccountScreenProps
> = ({ children, className }) => {
  const { userNumber } = useParams()
  const navigate = useNavigate()

  const { createAccount } = useAccount()

  const login = React.useCallback(async () => {
    if (!userNumber) throw new Error("userNumber is required")

    const response = await IIConnection.login(BigInt(userNumber))
    const result = apiResultToLoginResult(response)
    if (result.tag === "ok") {
      // TODO: get real data
      const account = {
        name: "John Doe",
        email: "test@test.de",
        phone_number: "0123456789",
        token: "123",
        anchor: BigInt(userNumber),
      }
      await createAccount(result.identityManager, account)

      navigate(`${RC.base}/${RC.linkInternetIdentitySuccess}`)
    }
  }, [createAccount, navigate, userNumber])
  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>One last step</CardTitle>
        <CardAction bottom className="justify-center">
          <Button block large filled onClick={login}>
            Use FaceID to finalize your account
          </Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
