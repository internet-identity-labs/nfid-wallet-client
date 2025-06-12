import clsx from "clsx"
import { FC } from "react"
import { FieldErrors, FieldValues } from "react-hook-form"

import {
  Button,
  IconCmpArrowConvert,
  IconCmpConvertWhite,
  Skeleton,
  Tooltip,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
} from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import ConvertArrowBox from "../assets/convert-arrow-box.png"
import ConvertIcon from "../assets/convert.svg"
import { IConversionFee } from "../utils"
import { ChooseFromToken } from "./choose-from-token"
import { ChooseToToken } from "./choose-to-token"
import { ConvertModal } from "./convert"

export const BALANCE_EDGE_LENGTH = 20

export interface ConvertFormProps {
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => void
  setFromChosenToken: (value: string) => void
  setToChosenToken: (value: string) => void
  isFeeLoading: boolean
  isOpen: boolean
  setConvertModal: (v: ConvertModal) => void
  amount: string
  errors: FieldErrors<FieldValues>
  handleReverse: () => void
  btcBalance?: bigint
  fee?: IConversionFee
  targetAmount: string
}

export const ConvertForm: FC<ConvertFormProps> = ({
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,
  isFeeLoading,
  isOpen,
  setConvertModal,
  amount,
  errors,
  handleReverse,
  btcBalance,
  fee,
  targetAmount,
}) => {
  return (
    <div className={clsx(!isOpen && "hidden")}>
      <div>
        <div
          className={clsx(
            "leading-10 text-[20px] font-bold mb-[18px]",
            "flex justify-between items-center",
          )}
        >
          <span>Convert</span>
          {isOpen && (
            <Tooltip
              align="end"
              alignOffset={-20}
              tip={
                <span className="block max-w-[300px]">Conversion details</span>
              }
            >
              <img
                className="cursor-pointer hover:opacity-60"
                src={ConvertIcon}
                alt="NFID swap settings"
                onClick={() => setConvertModal(ConvertModal.DETAILS)}
              />
            </Tooltip>
          )}
        </div>
        <p className="mb-1 text-xs select-none">From</p>
        <ChooseFromToken
          id={"convert-from-title"}
          token={fromToken}
          setFromChosenToken={setFromChosenToken}
          usdRate={toToken!.getTokenRateFormatted(amount || "0")}
          value={amount}
          title="Swap from"
          btcBalance={btcBalance}
          isConvertFromCkBtc={
            fromToken?.getTokenAddress() === CKBTC_CANISTER_ID &&
            toToken?.getTokenAddress() === BTC_NATIVE_ID
          }
        />
        {errors["amount"] && (
          <div className="h-4 mt-1 text-xs leading-4 text-red-600">
            {errors["amount"]?.message as string}
          </div>
        )}
        <div className="relative mt-[30px] mb-1 text-xs text-gray-500">
          <span className="select-none">To</span>
          <div
            className={clsx(
              "absolute -bottom-[4px] h-[30px] w-[85px] right-0 left-0",
              "flex justify-center items-center mx-auto text-black cursor-pointer",
            )}
            style={{
              backgroundImage: `url(${ConvertArrowBox})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={handleReverse}
          >
            <IconCmpArrowConvert className="h-5 w-[27px]" />
          </div>
        </div>
        <ChooseToToken
          token={toToken}
          setToChosenToken={setToChosenToken}
          usdRate={toToken!.getTokenRateFormatted(amount || "0")}
          isLoading={isFeeLoading}
          value={targetAmount}
          color="bg-gray-50"
        />
        <div
          className={clsx(
            "flex justify-between text-xs text-gray-500 font-inter",
            errors["amount"] ? "mt-[15px]" : "mt-[25px]",
          )}
        >
          <span>Network fees</span>
          {fee === undefined ? (
            <Skeleton className="w-[70px] h-4 rounded-lg" />
          ) : (
            <span>{fromToken?.getTokenRateFormatted(fee.total)}</span>
          )}
        </div>
        <Button
          className="absolute bottom-5 left-5 right-5 !w-auto"
          type="primary"
          id="swapTokensButton"
          block
          icon={
            !amount ? null : (
              <IconCmpConvertWhite className="text-gray-400 !w-[18px] !h-[18px] text-white" />
            )
          }
          disabled={
            isFeeLoading ||
            !amount ||
            Boolean(errors["amount"]?.message) ||
            !btcBalance ||
            !fee
          }
          onClick={submit}
        >
          {!amount ? "Enter an amount" : "Convert"}
        </Button>
      </div>
    </div>
  )
}
