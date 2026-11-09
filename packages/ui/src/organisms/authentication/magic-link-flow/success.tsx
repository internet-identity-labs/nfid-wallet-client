/* eslint-disable @nx/enforce-module-boundaries */
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import ImageVerified from "../images/verified.png"
import ImageVerifiedDark from "../images/verified-dark.png"
import { useDarkTheme } from "frontend/hooks"

export const EmailMagicLinkSuccess = () => {
  const isDark = useDarkTheme()
  return (
    <>
      <AuthAppMeta title="Email verified" />
      <p className="text-sm text-center dark:text-white">
        You’re connected. Please return to the original tab.
      </p>
      <img
        src={isDark ? ImageVerifiedDark : ImageVerified}
        alt="verified"
        className="w-full h-56 my-10"
      />
      <p className="text-sm text-center dark:text-white">
        You can close this window
      </p>
    </>
  )
}
