import { SwapSuccessUi } from "packages/ui/src/organisms/send-receive/components/swap-success"
import { FC, useState } from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { ISwapResponse, SuccessState } from "../types"

export interface ISwapSuccess {
  onClose?: () => void
  swap: Promise<ISwapResponse>
  titleFrom: string
  subTitleFrom: string
  titleTo: string
  subTitleTo: string
  assetImgFrom: string
  assetImgTo: string
  duration?: string
  withToasts?: boolean
}

export const SwapSuccess: FC<ISwapSuccess> = ({
  onClose,
  swap,
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  assetImgFrom,
  assetImgTo,
  duration = "20 seconds",
  withToasts = true,
}) => {
  const [currentState, setCurrentState] = useState<SuccessState>("pending")
  const [error, setError] = useState("")

  useSWR([swap, "swapPromise"], ([swap]) => swap, {
    onSuccess: async (data) => {
      console.debug("SwapProgress", data.swapProgress)
      // TODO: implement SwapProgress!
    },
    onError: async (e) => {
      setError(e.message)
      withToasts && toast.error("Swap wasn't successful!")
      setCurrentState("error")
    },
    revalidateOnFocus: false,
  })

  return (
    <SwapSuccessUi
      titleFrom={titleFrom}
      titleTo={titleTo}
      subTitleFrom={subTitleFrom}
      subTitleTo={subTitleTo}
      onClose={onClose!}
      assetImgFrom={assetImgFrom}
      assetImgTo={assetImgTo}
      step={currentState}
      duration={duration}
      error={error}
    />
  )
}
