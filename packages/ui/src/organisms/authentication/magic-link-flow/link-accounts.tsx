import { AuthAppMeta } from "@nfid/ui/organisms/authentication/app-meta"

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
        This email address has previously been registered.
        <br />
        Link your account with Google to access your account through either a
        sign in link or Google sign in.
      </p>
      <img alt="asset" src={LinkAsset} className="w-full h-56 my-10" />
      {googleButton}
    </>
  )
}
