import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import ImageVerified from "../images/verified.png"

export const EmailMagicLinkSuccess = () => {
  return (
    <>
      <AuthAppMeta title="Email verified" />
      <p className="text-sm text-center">
        You’re connected. Please return to the original tab.
      </p>
      <img src={ImageVerified} alt="verified" className="w-full h-56 my-10" />
      <p className="text-sm text-center">You can close this window</p>
    </>
  )
}
