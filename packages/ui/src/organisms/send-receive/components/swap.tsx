import BigNumber from "bignumber.js"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"
import { Id } from "react-toastify"
import useSWR from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  BlurredLoader,
  sumRules,
  IGroupedOptions,
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { AccountBalance } from "frontend/features/fungible-token/fetch-balances"
import { FT } from "frontend/integration/ft/ft"

import SwapArrowBox from "../assets/swap-arrow-box.png"
import WarningIcon from "../assets/swap-warning.svg"
import { ChooseFromToken, ChooseToToken } from "./choose-token"

export interface SwapFTUiProps {
  tokens: FT[]
  token: FT | undefined
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
  setChosenToken: (value: string) => void
  loadingMessage: string | undefined
  isLoading: boolean
}

export const SwapFTUi: FC<SwapFTUiProps> = ({
  tokens,
  token,
  errors,
  register,
  resetField,
  setValue,
  handleSubmit,
  submit,
  setChosenToken,
  loadingMessage,
  isLoading,
}) => {
  const [amountInUSD, setAmountInUSD] = useState(0)
  const [toTokenChosen, setToTokenChosen] = useState("")
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const [isPairFetched, setIsPairFetched] = useState(true)
  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

  const setButtonText = () => {
    if (!toTokenChosen) return "Select token"
    if (!amountInUSD) return "Enter an amount"
    if (!isPairFetched) return "Fetching quote"
    return "Swap tokens"
  }

  if (!token || isLoading)
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
      {errorModalOpen && (
        <div
          className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full p-5 bg-white/60"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="text-center max-w-[320px] mb-[50px]">
            <img
              className="w-[33px] mx-auto"
              src={WarningIcon}
              alt="NFID Warning"
            />
            <p className="my-4 font-bold leading-6 text-[20px]">
              Service temporarily unavailable
            </p>
            <p className="text-sm leading-5">
              Swapping through the current provider is temporarily unavailable.
              Please try again later.{" "}
            </p>
          </div>
          <Button
            className="h-[48px] absolute bottom-5 left-5 right-5 !w-auto"
            type="stroke"
            onClick={() => setErrorModalOpen(false)}
          >
            Refresh
          </Button>
        </div>
      )}
      {quoteModalOpen && (
        <ModalComponent
          isVisible={quoteModalOpen}
          onClose={() => {
            setQuoteModalOpen(false)
          }}
          className="p-5 w-[340px] sm:w-[450px] !h-[480px] z-[100] !rounded-[24px]"
        >
          <div>
            <div className="flex gap-[10px] items-center mb-2">
              <IconCmpArrow
                className="cursor-pointer"
                onClick={() => {
                  setQuoteModalOpen(false)
                }}
              />
              <div className="text-[20px] leading-[40px] font-bold">
                Swap quote
              </div>
            </div>
            <div
              className={clsx(
                "overflow-auto max-h-[396px] pr-[16px]",
                "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
              )}
            >
              <div className="text-sm">
                <div className="flex justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Quote rate</p>
                  <p>1 CHAT = 0.001 ckBTC</p>
                </div>
                <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Liquidity provider fee</p>
                  <p>0.000001 CHAT</p>
                  <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                    ICPSwap’s 0.3% fee.
                  </p>
                </div>
                <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Price impact</p>
                  <p>-0.47%</p>
                  <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                    The difference between the market price and your price due
                    to trade size.
                  </p>
                </div>
                <div className="flex justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Estimated transfer fee</p>
                  <p>
                    0.00002 CHAT <br />
                    0.00002 ckBTC
                  </p>
                </div>
                <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Max slippage</p>
                  <p>0%</p>
                  <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                    The amount the price can change before it’s reverted between
                    the time your order is placed and confirmed.
                  </p>
                </div>
                <div className="flex flex-wrap justify-between py-3 leading-5 border-b border-gray-100">
                  <p>Widget fee</p>
                  <p>0.000001 CHAT</p>
                  <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                    The fee of 0.875% is automatically factored into this quote
                    to support the NFID Wallet Community.
                  </p>
                </div>
                <div className="flex flex-wrap justify-between py-3 leading-5">
                  <p>Guaranteed amount</p>
                  <p>0.001 ckBTC</p>
                  <p className="text-xs text-gray-500 basis-[100%] leading-[19px] mt-1">
                    This is the minimum amount you will receive after all fees.
                    You may receive more depending on slippage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalComponent>
      )}
      <p className="mb-1 text-xs">From</p>
      <ChooseFromToken
        error={errors.amount}
        token={token}
        register={register}
        resetField={resetField}
        setAmountInUSD={setAmountInUSD}
        setChosenToken={setChosenToken}
        usdRate={usdRate}
        tokens={tokens}
        setValue={setValue}
      />
      <p className="relative mt-5 mb-1 text-xs text-gray-500">
        To
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
      </p>
      <ChooseToToken
        token={token}
        resetField={resetField}
        setAmountInUSD={setAmountInUSD}
        setChosenToken={setChosenToken}
        usdRate={usdRate}
        tokens={tokens}
        setToTokenChosen={setToTokenChosen}
        toTokenChosen={toTokenChosen}
        isPairFetched={isPairFetched}
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
            toTokenChosen && isPairFetched && amountInUSD
              ? "text-teal-600 cursor-pointer"
              : "text-gray-500"
          }
          onClick={() => {
            if (!toTokenChosen || !isPairFetched || !amountInUSD) return
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
        disabled={!isPairFetched || Boolean(toTokenChosen) || !amountInUSD}
        onClick={handleSubmit(submit)}
      >
        {setButtonText()}
      </Button>
    </>
  )
}
