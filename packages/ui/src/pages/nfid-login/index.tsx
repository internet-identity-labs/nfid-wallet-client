import clsx from "clsx"
import React from "react"

import { Button } from "@nfid-frontend/ui"
import { Profile } from "@nfid/integration"

import { ImageNFIDLogin } from "./components/image"
import { H2 } from "../../atoms/typography"
import { P } from "../../atoms/typography/paragraph"

interface AuthenticateNFIDLoginContentProps extends React.HTMLAttributes<HTMLDivElement> {
  account?: Profile
  iframe?: boolean
  errorMessage?: string
  onLogin?: () => void
  children?: React.ReactNode
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
          id="unlock-nfid"
          block={iframe}
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
