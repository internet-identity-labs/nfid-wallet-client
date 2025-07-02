import clsx from "clsx"
import { FC } from "react"

import { IconCmpArrow } from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"

import SwapArrowBox from "../assets/swap-success-arrow-box.png"
import { ConvertAnimation } from "./convert-animation"

export interface ConvertSuccessUiProps {
  titleFrom: string
  titleTo: string
  subTitleFrom: string
  subTitleTo: string
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  isOpen: boolean
  status: SendStatus
  duration?: number
  error?: string
}

export const ConvertSuccessUi: FC<ConvertSuccessUiProps> = ({
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  onClose,
  assetImgFrom,
  assetImgTo,
  isOpen,
  status,
  duration = 90,
  error,
}) => {
  return (
    <div
      id={"convert_success_window"}
      className={clsx(
        "text-black text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-grow flex-col bg-white",
        !isOpen && "hidden",
      )}
    >
      <div id={"convert-success-title"}>
        <H5 className="mt-5 text-xl !font-bold leading-6">
          {status === SendStatus.FAILED
            ? "Transaction failed"
            : status === SendStatus.COMPLETED
            ? "Your transaction is on the way"
            : "Converting"}
        </H5>
        <p className="h-5 mt-3 text-sm leading-5">
          {status === SendStatus.FAILED
            ? "Your assets are still in your wallet."
            : status === SendStatus.COMPLETED
            ? `${titleFrom} will be on your address after 6 Bitcoin network confirmations. This usually takes about 90 minutes.`
            : `Conversion usually takes around ${duration} minutes.`}
        </p>
      </div>
      <div
        className={clsx(
          "relative flex items-center justify-center w-full",
          error ? "mt-[30px]" : "mt-[90px]",
        )}
      >
        <div className="relative flex items-center justify-center w-full">
          <ConvertAnimation
            assetImg={assetImgFrom}
            assetImgTo={assetImgTo}
            status={status}
          />
        </div>
      </div>
      <div className="relative z-20 mt-[10px]">
        <div>
          <div className="pt-[10px] pb-[40px] relative">
            <p className="text-sm leading-[25px] font-inter" id="title">
              {titleFrom}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleFrom}
            </p>
            <div
              className={clsx(
                "absolute -bottom-[4px] h-[26px] w-[70px] right-0 left-0",
                "flex justify-center items-end mx-auto text-black",
              )}
              style={{
                backgroundImage: `url(${SwapArrowBox})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <IconCmpArrow className="rotate-[-90deg] h-5 w-5" />
            </div>
          </div>
          <div className="bg-gradient-to-b from-gray-50 to-white py-[10px] rounded-t-[12px]">
            <p className="text-sm leading-[25px] font-inter" id="title">
              {titleTo}
            </p>
            <p className="text-xs text-gray-500 leading-[18px]" id="subTitle">
              {subTitleTo}
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600 my-[10px]">
          Something went wrong with conversion. <br />
          Please try again later.
        </div>
      )}
      <Button
        id={"swap-success-close-button"}
        type="primary"
        className="mt-auto"
        block
        onClick={onClose}
      >
        Done
      </Button>
    </div>
  )
}
