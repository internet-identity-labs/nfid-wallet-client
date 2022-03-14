import clsx from "clsx"
import { Button } from "components/atoms/button"
import { H2, H5 } from "components/atoms/typography"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { Loader, P } from "frontend/ui-kit/src"
import React from "react"
import { ImageNFIDLogin } from "frontend/flows/screens-app/authenticate/image"

interface AuthenticateNFIDLoginContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const NFIDLogin: React.FC<AuthenticateNFIDLoginContentProps> = ({
  iframe,
}) => {
  const { account } = useAccount()
  const { isLoading, error, login } = useAuthentication()

  const title = "Unlock your NFID"

  return (
    <>
      <div>
        {iframe ? (
          <H5 className="mb-3">{title}</H5>
        ) : (
          <H2 className="my-6">{title}</H2>
        )}

        <P>
          The NFID on this device can only be unlocked by{" "}
          {account?.name || account?.anchor}.
        </P>
        <Button
          large={!iframe}
          block={iframe}
          secondary
          className="mt-8"
          onClick={login}
        >
          Unlock as {account?.name || account?.anchor}
        </Button>

        {error && (
          <div className={clsx("text-sm mt-2 text-red-base")}>{error}</div>
        )}

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>

      <ImageNFIDLogin />
    </>
  )
}
