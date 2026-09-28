import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"

import LinkAsset from "../images/link-accounts.png"

export interface EmailMagicLinkLinkProps {
  googleButton: JSX.Element
}

export const EmailMagicLinkLink: React.FC<EmailMagicLinkLinkProps> = ({
  googleButton,
}) => {
  return (
    <>
      <AuthAppMeta title="Link account" />
      <p className="text-sm text-center">
        This email is already connected to an NFID account.
        <br />
        Please sign in using Google or email link to access your wallet.
      </p>
      <img alt="asset" src={LinkAsset} className="w-full h-56 my-10" />
      {googleButton}
    </>
  )
}
