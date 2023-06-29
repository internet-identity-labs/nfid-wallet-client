import { Image } from "@nfid-frontend/ui"

import { AuthAppMeta } from "../../ui/app-meta"
import ImageExpired from "../images/expired.png"

export const EmailMagicLinkExpired = () => {
  return (
    <>
      <AuthAppMeta title="Sign in link expired" />
      <p className="text-sm text-center">
        Sign in links expire after 15 minutes, and can only be used once.
        Request a new link from the NFID sign in screen.
      </p>
      <Image src={ImageExpired} className="w-full h-56 my-10" />
      <p className="text-sm text-center">You can close this window</p>
    </>
  )
}
