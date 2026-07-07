import clsx from "clsx"
import { FC } from "react"

import { IconCmpArrow, IconCmpArrowWhite } from "@nfid-frontend/ui"
import { Button, H5 } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"

import SwapArrowBoxDark from "../assets/swap-success-arrow-box-dark.png"
import SwapArrowBox from "../assets/swap-success-arrow-box.png"
import { BridgeAnimation } from "./bridge-animation"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { SendStatus } from "frontend/features/transfer-modal/types"

export interface BridgeSuccessUiProps {
  titleFrom: string
  titleTo: string
  subTitleFrom: string
  subTitleTo: string
  tokenName: string
  tokenChain: ChainId
  onClose: () => void
  assetImgFrom: string
  assetImgTo: string
  isOpen: boolean
  status: SendStatus
  duration?: number
  error?: string
  isResponsive?: boolean
}

export const BridgeSuccessUi: FC<BridgeSuccessUiProps> = ({
  titleFrom,
  titleTo,
  subTitleFrom,
  subTitleTo,
  tokenName,
  tokenChain,
  onClose,
  assetImgFrom,
  assetImgTo,
  isOpen,
  status,
  duration = 5,
  error,
  isResponsive,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <div
      id={"bridge_success_window"}
      className={clsx(
        "text-black dark:text-white text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "flex flex-grow flex-col bg-white dark:bg-darkGray",
        !isOpen && "hidden",
      )}
    >
      <div id={"bridge-success-title"}>
        <H5 className="mt-5 text-xl !font-bold leading-6 dark:text-white">
          {status === SendStatus.FAILED
            ? "Transaction failed"
            : status === SendStatus.COMPLETED
              ? "Your transaction is on the way"
              : status === SendStatus.PENDING && "Bridging"}
        </H5>
        <p className="h-5 mt-3 text-sm leading-5">
          {status === SendStatus.FAILED
            ? "Your assets are still in your wallet."
            : status === SendStatus.COMPLETED
              ? `${tokenName} will be on your address soon. This usually takes about ${duration} minutes.`
              : status === SendStatus.PENDING &&
                `Bridge usually takes about ${duration} minutes.`}
        </p>
      </div>
      <div
        className={clsx(
          "relative flex items-center justify-center w-full",
          error ? "mt-[30px]" : "mt-[90px]",
        )}
      >
        <div className="relative flex items-center justify-center w-full">
          <BridgeAnimation
            assetImg={assetImgFrom}
            assetImgTo={assetImgTo}
            tokenChain={tokenChain}
            status={status}
          />
        </div>
      </div>
      <div
        className={clsx(
          "relative z-20 ",
          isResponsive ? "mt-[50px]" : "mt-[10px]",
        )}
      >
        <div>
          <div
            className={clsx(
              "relative",
              status === SendStatus.COMPLETED || status === SendStatus.FAILED
                ? "pt-[100px] pb-0"
                : "pt-[10px] pb-[40px]",
            )}
          >
            <p className="text-sm leading-[25px] font-inter" id="title">
              {titleFrom}
            </p>
            <p
              className="text-xs text-gray-500 dark:text-zinc-500 leading-[18px]"
              id="subTitle"
            >
              {subTitleFrom}
            </p>
            {status === SendStatus.PENDING && (
              <div
                className={clsx(
                  "absolute -bottom-[4px] h-[26px] w-[70px] right-0 left-0",
                  "flex justify-center items-end mx-auto text-black",
                )}
                style={{
                  backgroundImage: `url(${
                    isDarkTheme ? SwapArrowBoxDark : SwapArrowBox
                  })`,

                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {isDarkTheme ? (
                  <IconCmpArrowWhite className="rotate-[-90deg] h-5 w-5" />
                ) : (
                  <IconCmpArrow className="rotate-[-90deg] h-5 w-5" />
                )}
              </div>
            )}
          </div>
          {status === SendStatus.PENDING && (
            <div className="bg-gradient-to-b from-gray-50 dark:from-zinc-700 to-white dark:to-darkGray py-[10px] rounded-t-[12px]">
              <p className="text-sm leading-[25px] font-inter" id="title">
                {titleTo}
              </p>
              <p
                className="text-xs text-gray-500 dark:text-zinc-500 leading-[18px]"
                id="subTitle"
              >
                {subTitleTo}
              </p>
            </div>
          )}
        </div>
      </div>
      {error && <div className="text-sm text-red-600 my-[10px]">{error}</div>}
      <Button
        id={"bridge-success-close-button"}
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
