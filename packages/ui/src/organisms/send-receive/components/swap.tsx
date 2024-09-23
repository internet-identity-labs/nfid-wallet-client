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
  isLoading: boolean
  setToUsdAmount: (v: number) => void
  setFromUsdAmount: (v: number) => void
  fromUsdRate: string | undefined
  toUsdRate: string | undefined
  value: string
  slippageError: boolean
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
  isLoading,
  setToUsdAmount,
  setFromUsdAmount,
  fromUsdRate,
  toUsdRate,
  value,
  slippageError,
}) => {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [isPairFetched] = useState(true)

  if (isLoading)
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
      {errorModalOpen && <ErrorModal setErrorModalOpen={setErrorModalOpen} />}
      <QuoteModal
        quoteModalOpen={quoteModalOpen}
        setQuoteModalOpen={setQuoteModalOpen}
      />
      <p className="mb-1 text-xs">From</p>
      <ChooseFromToken
        error={errors.amount}
        token={fromToken}
        register={register}
        resetField={resetField}
        setFromUsdAmount={setFromUsdAmount}
        setToUsdAmount={setToUsdAmount}
        setFromChosenToken={setFromChosenToken}
        usdRate={fromUsdRate}
        tokens={tokens}
        setValue={setValue}
      />
      {errors.amount && (
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {errors.amount?.message}
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
        setToUsdAmount={setToUsdAmount}
        setToChosenToken={setToChosenToken}
        usdRate={toUsdRate}
        tokens={allTokens}
        isPairFetched={isPairFetched}
        register={register}
      />
      <div className="mt-[10px] flex items-center justify-between text-xs">
        {isPairFetched ? (
          <span className="text-gray-500">Quote rate</span>
        ) : (
          <div className="flex gap-[10px]">
            <Skeleton className="w-[66px] h-1 rounded-[4px] !bg-gray-200" />
            <Skeleton className="w-[30px] h-1 rounded-[4px] !bg-gray-200" />
          </div>
        )}
        <span
          className={
            isPairFetched ? "text-teal-600 cursor-pointer" : "text-gray-500"
          }
          onClick={() => {
            if (!isPairFetched || !value) return
            setQuoteModalOpen(true)
          }}
        >
          View quote
        </span>
      </div>
      {slippageError && (
        <div className="absolute bottom-[75px] text-xs text-red-600 left-5">
          Swap exceeded slippage tolerance. Try again.
        </div>
      )}
      <Button
        className="h-[48px] absolute bottom-5 left-5 right-5 !w-auto"
        type="primary"
        id="sendFT"
        block
        disabled={!isPairFetched || !value}
        onClick={handleSubmit(submit)}
      >
        {!value
          ? "Enter an amount"
          : !isPairFetched
          ? "Fetching quote"
          : "Swap tokens"}
      </Button>
    </>
  )
}
