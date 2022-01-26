import React from "react"
import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import { Button } from "@identity-labs/ui"

interface InternetAuthProps {}

export const IIAuth: React.FC<InternetAuthProps> = () => {
  const { authenticate } = useInternetIdentity()

  const handleAuthenticate = React.useCallback(async () => {
    await authenticate()
  }, [authenticate])

  return (
    <Button onClick={handleAuthenticate} filled>
      Login with II
    </Button>
  )
}
