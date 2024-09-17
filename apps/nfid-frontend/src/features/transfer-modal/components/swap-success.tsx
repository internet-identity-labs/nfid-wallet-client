import { SwapSuccessUi } from "packages/ui/src/organisms/send-receive/components/swap-success"
import { FC, useState } from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { ITransferResponse } from "frontend/ui/connnector/transfer-modal/types"

export interface ISwapSuccess {
  onClose?: () => void
  initialPromise: Promise<ITransferResponse>
  callback?: (res?: ITransferResponse) => void
  errorCallback?: (res?: ITransferResponse) => void
  titleFrom: string
  subTitleFrom: string
  titleTo: string
  subTitleTo: string
  assetImgFrom: string
  assetImgTo: string
  isAssetPadding?: boolean
  duration?: string
  withToasts?: boolean
}

export const SwapSuccess: FC<ISwapSuccess> = ({
  onClose,
  initialPromise,
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  assetImgFrom,
  assetImgTo,
  callback,
  errorCallback,
  duration = "20 seconds",
  withToasts = true,
}) => {
  const [currentState, setCurrentState] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [error, setError] = useState("")

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
            toast.success(`Transaction ${titleFrom} successful`, {
              toastId: "successTransfer",
            })
          callback && callback(data)
        }, 5000)
      },
      onError: async (e) => {
        setError(e.message)
        withToasts && toast.error("Something went wrong")
        setCurrentState(4)
      },
      revalidateOnFocus: false,
    },
  )

  return (
    <SwapSuccessUi
      titleFrom={titleFrom}
      titleTo={titleTo}
      subTitleFrom={subTitleFrom}
      subTitleTo={subTitleTo}
      url={data?.url}
      onClose={onClose!}
      assetImgFrom={assetImgFrom}
      assetImgTo={assetImgTo}
      step={currentState}
      duration={duration}
      error={error}
    />
  )
}
