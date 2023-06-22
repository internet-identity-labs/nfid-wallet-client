import { AuthAppMeta } from "../ui/app-meta"

export const EmailMagicLinkSuccess = () => {
  return (
    <>
      <AuthAppMeta title="Email verified" />
      <p className="text-sm text-center">
        You’re already signed in on the tab where you originally requested sign
        in.
      </p>
      <div className="w-full h-56 my-10 bg-gray-100" />
      <p className="text-sm text-center">You can close this window</p>
    </>
  )
}
