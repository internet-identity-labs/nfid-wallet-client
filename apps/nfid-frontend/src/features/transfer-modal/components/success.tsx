import React from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { ITransferResponse } from "frontend/ui/connnector/transfer-modal/types"

import { Success } from "../ui/success"

export interface ITransferSuccess {
  onClose?: () => void
  initialPromise: Promise<ITransferResponse>
  callback?: () => void
  title: string
  subTitle: string
  assetImg: string
  isAssetPadding?: boolean
}

export const TransferSuccess: React.FC<ITransferSuccess> = ({
  onClose,
  initialPromise,
  title,
  subTitle,
  assetImg,
  isAssetPadding,
  callback,
}) => {
  const [currentState, setCurrentState] = React.useState<0 | 1 | 2 | 3 | 4>(0)

  const { data } = useSWR(
    [initialPromise, "initialTransferPromise"],
    ([initialPromise]) => initialPromise,
    {
      onSuccess: async (data) => {
        if ("errorMessage" in data) {
          toast.error(data.errorMessage?.message ?? "Unknown error", {
            toastId: "failedTransfer",
          })
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
          }
          toast.success(`Transaction ${title} successful`, {
            toastId: "successTransfer",
          })
          callback && callback()
        }, 5000)
      },
      onError: () => {
        toast.error("Something went wrong")
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
    />
  )
}
