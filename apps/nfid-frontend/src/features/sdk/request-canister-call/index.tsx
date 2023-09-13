import clsx from "clsx"
import { useState } from "react"
import useSWR from "swr"

import { BlurredLoader, Button, IconCmpWarning } from "@nfid-frontend/ui"
import { executeCanisterCall } from "@nfid/integration"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"
import { RequestStatus } from "frontend/features/types"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import { SDKFooter } from "../ui/footer"
import { ICanisterCallResponse } from "./types"

export interface IRequestTransferProps {
  origin: string
  appMeta: AuthorizingAppMeta
  method: string
  canisterID: string
  args: string
  onConfirmIC: (data: ICanisterCallResponse) => void
}
export const RequestCanisterCall = ({
  origin,
  appMeta,
  method,
  canisterID,
  args,
  onConfirmIC,
}: IRequestTransferProps) => {
  console.log({ appMeta })
  const [isLoading, setIsLoading] = useState(false)
  const { data: identity } = useSWR(
    "globalIdentity",
    getWalletDelegationAdapter,
  )

  const handleExecuteCall = async () => {
    setIsLoading(true)
    try {
      const delegation = identity ?? (await getWalletDelegationAdapter())

      const res = await executeCanisterCall(
        origin,
        delegation,
        method,
        canisterID,
        args,
      )
      onConfirmIC({ status: RequestStatus.SUCCESS, response: res })
    } catch (e: any) {
      onConfirmIC({ status: RequestStatus.ERROR, errorMessage: e?.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <BlurredLoader isLoading={true} />

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url ?? appMeta.name}
        applicationName={appMeta?.name}
        title={method}
        subTitle="Request from"
      />
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] space-x-1.5 text-sm rounded-md",
          "bg-orange-50 p-[15px] mt-4 text-orange-900",
        )}
      >
        <div>
          <IconCmpWarning className="text-orange-900 h-[22px]" />
        </div>
        <div>
          <p className="font-bold leading-[20px]">Approval not recommended</p>
          <p className="mt-0.5">
            Unable to verify the safety of this approval. Please make sure you
            trust this dapp.
          </p>
        </div>
      </div>
      <div
        className={clsx(
          "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-3",
          "text-gray-500 break-all text-sm mt-2.5",
        )}
      >
        <div className="flex space-x-2.5">
          <span className="w-[100px] shrink-0">Canister ID</span>
          <span className="text-black">{canisterID}</span>
        </div>
        <span className="text-gray-500 mt-2.5">{args}</span>
      </div>
      <div className="space-y-2.5 flex flex-col mb-14 mt-6">
        <Button type="primary" onClick={handleExecuteCall}>
          Approve
        </Button>
        <Button
          type="stroke"
          onClick={() =>
            onConfirmIC({
              status: RequestStatus.REJECTED,
              errorMessage: "Rejected by user",
            })
          }
        >
          Reject
        </Button>

        <SDKFooter identity={identity} />
      </div>
    </>
  )
}
