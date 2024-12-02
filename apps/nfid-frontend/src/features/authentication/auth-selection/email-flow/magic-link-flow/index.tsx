import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { SignInWithGoogle } from "packages/ui/src/molecules/button/signin-with-google"
import { EmailMagicLinkExpired } from "packages/ui/src/organisms/authentication/magic-link-flow/expired"
import { EmailMagicLinkLink } from "packages/ui/src/organisms/authentication/magic-link-flow/link-accounts"
import { EmailMagicLinkSuccess } from "packages/ui/src/organisms/authentication/magic-link-flow/success"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Button, IconCmpGoogle, IconCmpNFID, Loader } from "@nfid-frontend/ui"

import { linkGoogle, verify } from "../services"

export const AuthEmailMagicLink = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<
    "success" | "invalid-token" | "link-required"
  >()
  const { token } = useParams()

  const verifyEmail = useCallback(async (token: string) => {
    const res = await verify("email", token)
    setStatus(res.status)
    setIsLoading(false)
    console.debug("AuthEmailMagicLink", { res })
  }, [])

  useEffect(() => {
    if (!token) return // UNREACHABLE
    verifyEmail(token)
  }, [token, verifyEmail])

  const handleLinkGoogle = useCallback(async (googleToken: string) => {
    setIsLoading(true)
    try {
      await linkGoogle(googleToken)
      setStatus("success")
    } catch (e: any) {
      toaster.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div
      className="w-screen h-screen py-3 px-[30px] flex flex-col items-center"
      style={{
        background:
          "linear-gradient(180deg, #E4EBFF 0%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <div className="flex w-full">
        <IconCmpNFID />
      </div>

      <div
        className={clsx(
          "max-w-[450px] h-[580px] bg-white px-5 py-2.5",
          "border border-gray-100 my-auto",
          "flex flex-col items-center rounded-xl",
        )}
      >
        {isLoading ? (
          <div className="w-full h-full sm:w-[410px] flex items-center justify-center">
            <div className="w-20 h-20">
              <Loader isLoading={true} fullscreen={false} />
            </div>
          </div>
        ) : status === "invalid-token" ? (
          <EmailMagicLinkExpired />
        ) : status === "success" ? (
          <EmailMagicLinkSuccess />
        ) : status === "link-required" ? (
          <EmailMagicLinkLink
            googleButton={
              <SignInWithGoogle
                onLogin={(credential) =>
                  handleLinkGoogle(credential.credential)
                }
                button={
                  <Button
                    className="h-12 !p-0"
                    type="stroke"
                    icon={<IconCmpGoogle />}
                    block
                  >
                    Continue with Google
                  </Button>
                }
              />
            }
          />
        ) : null}
      </div>
    </div>
  )
}
