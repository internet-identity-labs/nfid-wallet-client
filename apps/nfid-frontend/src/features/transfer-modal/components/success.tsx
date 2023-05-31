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
  const [currentState, setCurrentState] = React.useState<0 | 1 | 2 | 3>(0)
  console.log({ initialPromise })
  const { data } = useSWR(
    [initialPromise, "initialTransferPromise"],
    ([initialPromise]) => initialPromise,
    {
      onSuccess: async (data) => {
        setCurrentState(1)
        setTimeout(async () => {
          if (!data?.verifyPromise) {
            setCurrentState(3)
          } else {
            setCurrentState(2)
            await data.verifyPromise
            setCurrentState(3)
          }
          callback && callback()
        }, 5000)
      },
      onError: () => toast.error("Something went wrong"),
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
