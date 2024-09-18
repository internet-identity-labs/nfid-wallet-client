import BigNumber from "bignumber.js"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
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
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { AccountBalance } from "frontend/features/fungible-token/fetch-balances"
import { FT } from "frontend/integration/ft/ft"

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
  const [isToTokenChosen, setIsToTokenChosen] = useState(false)
  const { data: usdRate } = useSWR(
    token ? ["tokenRate", token.getTokenAddress(), amountInUSD] : null,
    ([_, __, amount]) => token?.getTokenRateFormatted(amount.toString()),
  )

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
      <p className="mt-5 mb-1 text-xs text-gray-500">To</p>
      <ChooseToToken
        token={token}
        //register={register}
        resetField={resetField}
        setAmountInUSD={setAmountInUSD}
        setChosenToken={setChosenToken}
        usdRate={usdRate}
        tokens={tokens}
      />
      <div className="mt-[10px] flex items-center justify-between text-xs">
        <span className="text-gray-500">Quote rate</span>
        <span className="text-gray-500">View quote</span>
      </div>
      <Button
        className="h-[48px] absolute bottom-5 left-5 right-5 !w-auto"
        type="primary"
        id="sendFT"
        block
        onClick={handleSubmit(submit)}
        icon={<IconCmpArrow className="rotate-[135deg]" />}
      >
        Send
      </Button>
    </>
  )
}
