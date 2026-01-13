import { AuthAppMeta } from "@nfid/ui/organisms/authentication/app-meta"

import ImageVerified from "../images/verified.png"

export const EmailMagicLinkSuccess = () => {
  return (
    <>
      <AuthAppMeta title="Email verified" />
      <p className="text-sm text-center">
        You’re signed in on the tab where you originally requested sign in.
      </p>
      <img src={ImageVerified} alt="verified" className="w-full h-56 my-10" />
      <p className="text-sm text-center">You can close this window</p>
    </>
  )
}
