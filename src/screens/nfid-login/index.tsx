import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { H2 } from "@internet-identity-labs/nfid-sdk-react"
import { Loader, P } from "@internet-identity-labs/nfid-sdk-react"

import { ImageNFIDLogin } from "frontend/flows/screens-app/authenticate/image"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface AuthenticateNFIDLoginContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  iframe?: boolean
  loginSuccessPath?: string
}

export const NFIDLogin: React.FC<AuthenticateNFIDLoginContentProps> = ({
  iframe,
  loginSuccessPath,
}) => {
  const { account } = useAccount()
  const { isLoading, error, login } = useAuthentication()
  const { generatePath } = useNFIDNavigate()
  const navigate = useNavigate()

  const title = "Unlock your NFID"

  const handleLogin = async () => {
    const result = await login()

    if (result.tag === "ok") {
      if (loginSuccessPath) {
        navigate(generatePath(loginSuccessPath))
      }
    }
  }

  return (
    <>
      <div>
        <H2 className="my-6">{title}</H2>

        <P>
          The NFID on this device can only be unlocked by{" "}
          {account?.name || account?.anchor}.
        </P>
        <Button
          large={!iframe}
          block={iframe}
          secondary
          className="mt-8"
          onClick={handleLogin}
          onTouchStart={handleLogin}
        >
          Unlock as {account?.name || account?.anchor}
        </Button>

        {error && (
          <div className={clsx("text-sm mt-2 text-red-base")}>
            {error.message}
          </div>
        )}

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>

      <ImageNFIDLogin />
    </>
  )
}
