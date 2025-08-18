import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { FC } from "react"
import { FieldErrors, FieldValues } from "react-hook-form"

import {
  Button,
  IconCmpArrowConvert,
  IconCmpConvertWhite,
  IconCmpConvert,
  Skeleton,
  Tooltip,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  ETH_DECIMALS,
} from "@nfid/integration/token/constants"

import { useDarkTheme } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"

import ConvertArrowBoxDark from "../assets/convert-arrow-box-dark.png"
import ConvertArrowBox from "../assets/convert-arrow-box.png"
import ConvertDarkIcon from "../assets/convert-dark.svg"
import ConvertIcon from "../assets/convert.svg"
import { getModalType, IConversionFee, IModalType } from "../utils"
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
  conversionError: string | undefined
  handleReverse: () => void
  fee?: IConversionFee | bigint
  targetAmount: string
  tokens: FT[]
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
  conversionError,
  handleReverse,
  fee,
  targetAmount,
  tokens,
}) => {
  const isDarkTheme = useDarkTheme()
  const isDisabled =
    isFeeLoading ||
    !amount ||
    Boolean(errors["amount"]?.message) ||
    !fee ||
    Boolean(conversionError)

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
                src={isDarkTheme ? ConvertDarkIcon : ConvertIcon}
                alt="NFID swap settings"
                onClick={() => setConvertModal(ConvertModal.DETAILS)}
              />
            </Tooltip>
          )}
        </div>
        <p className="mb-1 text-xs select-none">From</p>
        <ChooseFromToken
          modalType={getModalType(fromToken, toToken)}
          id={"convert-from-title"}
          token={fromToken}
          setFromChosenToken={setFromChosenToken}
          usdRate={toToken!.getTokenRateFormatted(amount || "0")}
          value={amount}
          tokens={tokens}
          title="Convert from"
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
          setToChosenToken={setToChosenToken}
          usdRate={toToken!.getTokenRateFormatted(
            typeof fee === "bigint"
              ? (+amount - Number(fee) / 10 ** ETH_DECIMALS).toString()
              : fee && fee.total
              ? (+amount - +fee?.total).toString() || "0"
              : "0",
          )}
          isLoading={isFeeLoading}
          value={targetAmount}
          color="bg-gray-50 dark:bg-zinc-700"
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
            <span>
              {fromToken?.getTokenRateFormatted(
                typeof fee === "bigint" ? fee.toString() : fee.total,
              )}
            </span>
          )}
        </div>
        {conversionError && (
          <div className="mt-2 text-xs text-red-600">{conversionError}</div>
        )}
        <Button
          className="absolute bottom-5 left-5 right-5 !w-auto"
          type="primary"
          id="swapTokensButton"
          block
          icon={
            !amount ? null : fee === undefined && !conversionError ? (
              <Spinner className="w-5 h-5 text-white" />
            ) : (
              <IconCmpConvertWhite className="text-gray-400 !w-[18px] !h-[18px] text-white" />
            )
          }
          disabled={isDisabled}
          onClick={submit}
        >
          {!amount
            ? "Enter an amount"
            : fee === undefined && !conversionError
            ? "Calculating fee"
            : "Convert"}
        </Button>
      </div>
    </div>
  )
}
