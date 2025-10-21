import clsx from "clsx"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import React from "react"

import { Button } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"

import ImageVerifiedDark from "../images/verified-dark.png"
import ImageVerified from "../images/verified.png"

export interface AuthEmailVerifiedProps {
  onContinue: () => void
  isIdentityKit?: boolean
}

export const AuthEmailVerified: React.FC<AuthEmailVerifiedProps> = ({
  onContinue,
  isIdentityKit,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <div className="flex flex-col flex-1 w-full h-full text-sm text-center">
      <AuthAppMeta title="Sign in verified" withLogo={!isIdentityKit} />
      <p className="dark:text-white">
        You may now continue to the application.
      </p>
      <img
        src={isDarkTheme ? ImageVerifiedDark : ImageVerified}
        className={clsx(
          "object-contain my-9",
          isDarkTheme ? "w-[75%] mx-auto" : "w-full",
        )}
        alt="verified"
      />
      <div className="flex-1"></div>
      <Button type="primary" block onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
