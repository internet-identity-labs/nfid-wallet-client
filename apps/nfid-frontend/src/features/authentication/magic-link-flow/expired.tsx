import { AuthAppMeta } from "../ui/app-meta"

export const EmailMagicLinkExpired = () => {
  return (
    <>
      <AuthAppMeta title="Sign in link expired" />
      <p className="text-sm text-center">
        Sign in links expire after 15 minutes, and can only be used once.
        Request a new link from the NFID sign in screen.
      </p>
      <div className="w-full h-56 my-10 bg-gray-100" />
      <p className="text-sm text-center">You can close this window</p>
    </>
  )
}
