import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import ImageExpired from "../images/expired.png"

export const EmailMagicLinkExpired = () => {
  return (
    <>
      <AuthAppMeta title="Link expired" />
      <p className="text-sm text-center dark:text-white">
        Links expire after 15 minutes, and can only be used once. Request a new
        link from the NFID connect screen.
      </p>
      <img alt="expired" src={ImageExpired} className="w-full h-56 mt-10" />
      <p className="mt-auto mb-2 text-sm text-center dark:text-white">
        You can close this window
      </p>
    </>
  )
}
