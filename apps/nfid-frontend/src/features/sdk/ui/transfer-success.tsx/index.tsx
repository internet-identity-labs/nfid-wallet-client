import { Icrc1BlockIndex } from "@dfinity/ledger-icp"
import toaster from "packages/ui/src/atoms/toast"
import React from "react"

import { useSWR } from "@nfid/swr"

import { Success } from "./success"

export interface ITransferResponse {
  verifyPromise?: Promise<void>
  errorMessage?: Error
  url?: string
  hash?: string
  blockIndex?: Icrc1BlockIndex
}

export interface ITransferSuccess {
  onClose?: () => void
  initialPromise: Promise<ITransferResponse>
  callback?: (res?: ITransferResponse) => void
  errorCallback?: (res?: ITransferResponse) => void
  title: string
  subTitle: string
  assetImg: string
  isAssetPadding?: boolean
  duration?: string
  withToasts?: boolean
}

export const TransferSuccess: React.FC<ITransferSuccess> = ({
  onClose,
  initialPromise,
  title,
  subTitle,
  assetImg,
  isAssetPadding,
  callback,
  errorCallback,
  duration = "2 seconds",
  withToasts = true,
}) => {
  const [currentState, setCurrentState] = React.useState<number>(0)

  const { data } = useSWR(
    [initialPromise, "initialTransferPromise"],
    ([initialPromise]) => initialPromise,
    {
      onSuccess: async (data) => {
        if ("errorMessage" in data) {
          withToasts &&
            toaster.error(data.errorMessage?.message ?? "Unknown error", {
              toastId: "failedTransfer",
            })
          errorCallback?.(data)
          return setCurrentState(4)
        }
        setCurrentState(1)
        setTimeout(async () => {
          if (!data?.verifyPromise) {
            setCurrentState(3)
          } else {
            setCurrentState(2)
            await data.verifyPromise
            setCurrentState(3)
            await new Promise((resolve) =>
              setTimeout(() => resolve(true), 2000),
            )
          }
          withToasts &&
            toaster.success(`Transaction ${title} successful`, {
              toastId: "successTransfer",
            })
          callback?.(data)
        }, 5000)
      },
      onError: async () => {
        withToasts && toaster.error("Something went wrong")
        setCurrentState(4)
      },
      revalidateOnFocus: false,
    },
  )
  return (
    <Success
      title={title}
      subTitle={subTitle}
      url={data?.url}
      onClose={onClose!}
      assetImg={assetImg}
      step={currentState}
      isAssetPadding={isAssetPadding}
      duration={duration}
    />
  )
}
