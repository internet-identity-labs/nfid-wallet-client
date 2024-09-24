import clsx from "clsx"
import { FC, useState } from "react"
import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  IconCmpArrow,
  BlurredLoader,
  Skeleton,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { Quote } from "frontend/integration/icpswap/quote"

import SwapArrowBox from "../assets/swap-arrow-box.png"
import { ChooseFromToken, ChooseToToken } from "./choose-token"
import { ErrorModal } from "./error-modal"
import { QuoteModal } from "./quote-modal"

export interface SwapFTUiProps {
  tokens: FT[]
  allTokens: FT[]
  fromToken: FT | undefined
  toToken: FT | undefined
  errors: Partial<
    FieldErrorsImpl<{
      amount: string
      to: string
    }>
  >
  register: UseFormRegister<{
    amount: string
    to: string
  }>
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
  setValue: UseFormSetValue<{
    amount: string
    to: string
  }>
  handleSubmit: UseFormHandleSubmit<{
    amount: string
    to: string
  }>
  submit: (values: { amount: string; to: string }) => Promise<void | Id>
  setFromChosenToken: (value: string) => void
  setToChosenToken: (value: string) => void
  loadingMessage: string | undefined
  isTokenLoading: boolean
  value: string
  showServiceError: boolean
  showLiquidityError: Error | undefined
  isQuoteLoading: boolean
  quote: Quote | undefined
  clearQuoteError: () => void
}

export const SwapFTUi: FC<SwapFTUiProps> = ({
  tokens,
  allTokens,
  fromToken,
  toToken,
  errors,
  register,
  resetField,
  setValue,
  handleSubmit,
  submit,
  setFromChosenToken,
  setToChosenToken,
  loadingMessage,
  isTokenLoading,
  value,
  showServiceError,
  showLiquidityError,
  clearQuoteError,
  isQuoteLoading,
  quote,
}) => {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)

  if (isTokenLoading)
    return (
      <BlurredLoader
        isLoading
        loadingMessage={loadingMessage}
        overlayClassnames="rounded-xl"
        className="text-xs"
      />
    )
  return (
    <>
      {showServiceError && <ErrorModal refresh={clearQuoteError} />}
      <QuoteModal
        modalOpen={quoteModalOpen}
        setModalOpen={setQuoteModalOpen}
        quote={quote}
      />
      <p className="mb-1 text-xs">From</p>
      <ChooseFromToken
        error={errors.amount}
        token={fromToken}
        register={register}
        resetField={resetField}
        setFromChosenToken={setFromChosenToken}
        usdRate={quote?.getSourceAmountUSD()}
        tokens={tokens}
        setValue={setValue}
        showLiquidityError={showLiquidityError}
      />
      {errors.amount && (
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {errors.amount?.message}
        </div>
      )}
      {showLiquidityError && (
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {showLiquidityError?.message}
        </div>
      )}

      <div className="relative mt-5 mb-1 text-xs text-gray-500">
        <span>To</span>
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
      <ChooseToToken
        token={toToken}
        resetField={resetField}
        setToChosenToken={setToChosenToken}
        usdRate={quote?.getTargetAmountUSD()}
        tokens={allTokens}
        isQuoteLoading={isQuoteLoading}
        register={register}
        value={quote?.getTargetAmountPrettified()}
        setValue={setValue}
      />
      <div className="mt-[10px] flex items-center justify-between text-xs text-gray-500">
        {!value ? (
          "Quote rate"
        ) : isQuoteLoading ? (
          <div className="flex gap-[10px]">
            <Skeleton className="w-[66px] h-1 rounded-[4px] !bg-gray-200" />
            <Skeleton className="w-[30px] h-1 rounded-[4px] !bg-gray-200" />
          </div>
        ) : (
          `${quote?.getQuoteRate()} (30 sec)`
        )}
        <span
          className={
            !isQuoteLoading && value
              ? "text-teal-600 cursor-pointer"
              : "text-gray-500"
          }
          onClick={() => {
            if (isQuoteLoading || !value) return
            setQuoteModalOpen(true)
          }}
        >
          View quote
        </span>
      </div>
      <Button
        className="h-[48px] absolute bottom-5 left-5 right-5 !w-auto"
        type="primary"
        id="sendFT"
        block
        disabled={isQuoteLoading || !value}
        onClick={handleSubmit(submit)}
      >
        {!value
          ? "Enter an amount"
          : isQuoteLoading
          ? "Fetching quote"
          : "Swap tokens"}
      </Button>
    </>
  )
}
