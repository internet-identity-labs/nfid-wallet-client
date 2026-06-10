import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { FC, useEffect, useState } from "react"
import { FieldErrors, FieldValues } from "react-hook-form"

import {
  Button,
  IconCmpArrowConvert,
  IconCmpBridge,
  Skeleton,
  Tooltip,
} from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"
import { SelectedToken } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import ConvertArrowBoxDark from "../assets/convert-arrow-box-dark.png"
import ConvertArrowBox from "../assets/convert-arrow-box.png"
import ConvertDarkIcon from "../assets/convert-dark.svg?url"
import ConvertIcon from "../assets/convert.svg?url"
import { IModalType } from "../utils"
import { ChooseFromToken } from "./choose-from-token"
import { ChooseToToken } from "./choose-to-token"
import { BridgeModal } from "./bridge"
import { EstimatedBridge } from "./bridge"

export interface BridgeFormProps {
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => void
  setFromChosenToken: (value: SelectedToken) => void
  setToChosenToken: (value: SelectedToken) => void
  isOpen: boolean
  setBridgeModal: (v: BridgeModal) => void
  amount: string
  errors: FieldErrors<FieldValues>
  bridgeError: string | undefined
  handleReverse: () => void
  bridgeData?: EstimatedBridge
  isBridgeDataLoading: boolean
  tokens?: FT[]
  toTokens?: FT[]
  isResponsive?: boolean
  setIsResponsive?: (value: boolean) => void
  setSkipFeeCalculation?: () => void
  onMaxResolved?: () => void
}

export const BridgeForm: FC<BridgeFormProps> = ({
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,

  isOpen,
  setBridgeModal,
  amount,
  errors,
  bridgeError,
  handleReverse,
  bridgeData,
  isBridgeDataLoading,
  tokens,
  toTokens,
  isResponsive,
  setIsResponsive,
  setSkipFeeCalculation,
  onMaxResolved,
}) => {
  const [isFromResponsive, setIsFromResponsive] = useState(false)
  const [isToResponsive, setIsToResponsive] = useState(false)

  useEffect(() => {
    if (setIsResponsive) {
      setIsResponsive(isFromResponsive || isToResponsive)
    }
  }, [isFromResponsive, isToResponsive, setIsResponsive])

  const isDarkTheme = useDarkTheme()
  const isDisabled =
    isBridgeDataLoading ||
    !amount ||
    Boolean(errors["amount"]?.message) ||
    !bridgeData ||
    Boolean(bridgeError)

  return (
    <div className={clsx(!isOpen && "hidden", isResponsive && "pb-[70px]")}>
      <div>
        <div
          className={clsx(
            "leading-10 text-[20px] font-bold mb-[18px]",
            "flex justify-between items-center",
          )}
        >
          <span>Bridge</span>
          {isOpen && (
            <Tooltip
              align="end"
              alignOffset={-20}
              tip={<span className="block max-w-[300px]">Bridge details</span>}
            >
              <img
                className="cursor-pointer hover:opacity-60"
                src={isDarkTheme ? ConvertDarkIcon : ConvertIcon}
                alt="NFID swap settings"
                onClick={() => setBridgeModal(BridgeModal.DETAILS)}
              />
            </Tooltip>
          )}
        </div>
        <p className="mb-1 text-xs select-none">From</p>
        <ChooseFromToken
          modalType={IModalType.BRIDGE}
          id={"bridge-from-title"}
          token={fromToken}
          setFromChosenToken={setFromChosenToken}
          usdRate={bridgeData?.amountFromUsd}
          value={amount}
          tokens={tokens}
          title="Bridge from"
          isResponsive={isResponsive}
          setIsResponsive={setIsFromResponsive}
          resetKey={
            toToken
              ? `${toToken.getChainId()}:${toToken.getTokenAddress()}`
              : ""
          }
          withNetwork
          fee={bridgeData?.rawFee}
          setSkipFeeCalculation={setSkipFeeCalculation}
          onMaxResolved={onMaxResolved}
        />
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {errors["amount"] && (errors["amount"]?.message as string)}
        </div>
        <div className="relative mt-[14px] mb-1 text-xs text-gray-500">
          <span className="select-none">To</span>
          <div
            className={clsx(
              "absolute -bottom-[4px] h-[30px] w-[85px] right-0 left-0",
              "flex justify-center items-center mx-auto text-black cursor-pointer",
            )}
            style={{
              backgroundImage: `url(${
                isDarkTheme ? ConvertArrowBoxDark : ConvertArrowBox
              })`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={handleReverse}
          >
            <IconCmpArrowConvert className="h-5 w-[27px] dark:text-white" />
          </div>
        </div>
        <ChooseToToken
          token={toToken}
          tokens={toTokens}
          setToChosenToken={setToChosenToken}
          usdRate={bridgeData?.amountToUsd}
          isLoading={isBridgeDataLoading && !!amount && !errors["amount"]}
          value={
            !bridgeData?.amountTo
              ? "0.00"
              : parseFloat(bridgeData?.amountTo || "0.00").toString()
          }
          color="bg-gray-50 dark:bg-zinc-700"
          isResponsive={isResponsive}
          setIsResponsive={setIsToResponsive}
          withNetwork
          title="Bridge to"
          tooltipText="Networks that can’t be selected lack enough liquidity for bridging."
        />
        <div
          className={clsx(
            "flex justify-between text-xs text-gray-500 font-inter",
            errors["amount"] ? "mt-[15px]" : "mt-[25px]",
          )}
        >
          <span>Network fees</span>
          {!amount || errors["amount"] ? null : bridgeData === undefined ? (
            <Skeleton className="w-[70px] h-4 rounded-lg" />
          ) : (
            <span>{bridgeData.totalUsdCost}</span>
          )}
        </div>
        {bridgeError && (
          <div className="mt-2 text-xs text-red-600">{bridgeError}</div>
        )}
        <Button
          className="absolute bottom-5 left-5 right-5 !w-auto"
          type="primary"
          id="swapTokensButton"
          block
          icon={
            !amount || errors["amount"] ? null : bridgeData === undefined &&
              !bridgeError ? (
              <Spinner className="w-5 h-5 text-white" />
            ) : (
              <IconCmpBridge
                className={clsx(
                  "!w-[18px] !h-[18px]",
                  isDisabled
                    ? "text-cecondary dark:text-zinc-500"
                    : "text-white",
                )}
              />
            )
          }
          disabled={isDisabled}
          onClick={submit}
        >
          {!amount
            ? "Enter an amount"
            : bridgeData === undefined && !bridgeError && !errors["amount"]
              ? "Calculating fee"
              : "Bridge"}
        </Button>
      </div>
    </div>
  )
}
