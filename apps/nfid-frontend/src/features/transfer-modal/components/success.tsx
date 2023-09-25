import React from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { ITransferResponse } from "frontend/ui/connnector/transfer-modal/types"

import { Success } from "../ui/success"

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
  duration = "10 min",
  withToasts = true,
}) => {
  const [currentState, setCurrentState] = React.useState<0 | 1 | 2 | 3 | 4>(0)

  const { data } = useSWR(
    [initialPromise, "initialTransferPromise"],
    ([initialPromise]) => initialPromise,
    {
      onSuccess: async (data) => {
        if ("errorMessage" in data) {
          withToasts &&
            toast.error(data.errorMessage?.message ?? "Unknown error", {
              toastId: "failedTransfer",
            })
          errorCallback && errorCallback(data)
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
            toast.success(`Transaction ${title} successful`, {
              toastId: "successTransfer",
            })
          callback && callback(data)
        }, 5000)
      },
      onError: async () => {
        withToasts && toast.error("Something went wrong")
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
