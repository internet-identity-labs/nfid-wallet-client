import clsx from "clsx"
import { AuthAppMeta } from "packages/ui/src/organisms/authentication/app-meta"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { IconCmpNFIDWalletLogoBlack, Loader } from "@nfid-frontend/ui"

import { ic } from "@nfid/integration"

const approveLoginIpEndpointUrl = "/login/ip"

type State =
  | { status: "LOADING" }
  | { status: "DONE"; title: string; description: string }
  | { status: "ERROR"; message: string }

async function approveLoginIp(
  token: string,
): Promise<{ title: string; description: string }> {
  const base = ic.isLocal ? approveLoginIpEndpointUrl : AWS_APPROVE_LOGIN_IP
  const response = await fetch(`${base}/${token}`)
  try {
    return await response.json()
  } catch {
    throw new Error("Please try again later.")
  }
}

function getContent(
  state: State,
): { title: string; description: string } | null {
  if (state.status === "LOADING") return null
  if (state.status === "ERROR") {
    return { title: "Something went wrong", description: state.message }
  }
  return { title: state.title, description: state.description }
}

export const AuthApproveLoginIp = () => {
  const [state, setState] = useState<State>({ status: "LOADING" })
  const { token } = useParams()

  useEffect(() => {
    if (!token) return
    approveLoginIp(token)
      .then((data) =>
        setState({
          status: "DONE",
          title: data.title,
          description: data.description,
        }),
      )
      .catch((e: any) =>
        setState({
          status: "ERROR",
          message: e?.message ?? "Something went wrong.",
        }),
      )
  }, [token])

  const content = getContent(state)

  return (
    <div
      className="w-screen h-screen py-3 px-[30px] flex flex-col items-center"
      style={{
        background:
          "linear-gradient(180deg, #E4EBFF 0%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <div className="flex w-full">
        <IconCmpNFIDWalletLogoBlack />
      </div>

      <div
        className={clsx(
          "w-full max-w-[450px] h-[580px] bg-white px-5 py-2.5",
          "border border-gray-100 my-auto",
          "flex flex-col items-center rounded-xl",
        )}
      >
        {state.status === "LOADING" ? (
          <div className="w-full h-full sm:w-[410px] flex items-center justify-center">
            <div className="w-20 h-20">
              <Loader isLoading={true} fullscreen={false} />
            </div>
          </div>
        ) : (
          <>
            <AuthAppMeta title={content!.title} />
            <p className="text-sm text-center">{content!.description}</p>
            <p className="text-sm text-center mt-auto">
              You can close this window.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
