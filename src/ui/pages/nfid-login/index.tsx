import clsx from "clsx"
import React from "react"

import { ImageNFIDLogin } from "frontend/apps/authentication/authenticate/image"
import { Profile } from "frontend/integration/identity-manager"
import { Button } from "frontend/ui/atoms/button"
import { H2 } from "frontend/ui/atoms/typography"
import { P } from "frontend/ui/atoms/typography/paragraph"

interface AuthenticateNFIDLoginContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  account?: Profile
  iframe?: boolean
  errorMessage?: string
  onLogin?: () => void
}

export const NFIDLogin: React.FC<AuthenticateNFIDLoginContentProps> = ({
  iframe,
  account,
  errorMessage,
  onLogin,
}) => {
  const title = "Unlock your NFID"

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
          onClick={onLogin}
          onTouchStart={onLogin}
        >
          Unlock as {account?.name || account?.anchor}
        </Button>

        {errorMessage && (
          <div className={clsx("text-sm mt-2 text-red-base")}>
            {errorMessage}
          </div>
        )}
      </div>

      <ImageNFIDLogin />
    </>
  )
}
