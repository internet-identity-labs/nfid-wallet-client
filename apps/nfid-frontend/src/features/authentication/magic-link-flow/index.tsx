import clsx from "clsx"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { IconCmpNFID, Loader } from "@nfid-frontend/ui"

import { verify } from "../email-flow/services"
import { EmailMagicLinkExpired } from "./expired"
import { EmailMagicLinkLink } from "./link-accounts"
import { EmailMagicLinkSuccess } from "./sucess"

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
  }, [])

  useEffect(() => {
    if (!token) return // UNREACHABLE
    verifyEmail(token)
  }, [token, verifyEmail])

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
          <EmailMagicLinkLink />
        ) : null}
      </div>
    </div>
  )
}
