import { debounce } from "@dfinity/utils"
import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { ChangeEvent, FC, useEffect, useState } from "react"
import {
  FieldError,
  UseFormRegister,
  UseFormResetField,
  UseFormSetValue,
} from "react-hook-form"

import {
  ChooseModal,
  IconCmpArrowRight,
  sumRules,
  IGroupedOptions,
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"

import { getTokenOptions, getTokenOptionsVault } from "../utils"

interface ChooseFromTokenProps {
  error: FieldError | undefined
  token: FT | undefined
  tokens: FT[]
  register: UseFormRegister<{
    amount: string
    to: string
  }>
  balance?: bigint | undefined
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
  setFromChosenToken: (value: string) => void
  sendReceiveTrackingFn?: () => void
  usdRate: string | undefined
  setValue: UseFormSetValue<{
    amount: string
    to: string
  }>
  setFromUsdAmount?: (v: number) => void
  showLiquidityError?: Error | undefined
}

interface ChooseToTokenProps {
  token: FT | undefined
  tokens: FT[]
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
  setToChosenToken: (value: string) => void
  sendReceiveTrackingFn?: () => void
  usdRate: string | undefined
  isQuoteLoading: boolean
  register: UseFormRegister<{
    amount: string
    to: string
  }>
  setValue: UseFormSetValue<{
    amount: string
    to: string
  }>
  value: string | undefined
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  error,
  token,
  tokens,
  register,
  balance,
  setFromUsdAmount,
  resetField,
  setFromChosenToken,
  sendReceiveTrackingFn,
  usdRate,
  setValue,
  showLiquidityError,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])

  useEffect(() => {
    balance !== undefined
      ? getTokenOptionsVault(tokens)
      : getTokenOptions(tokens).then(setTokenOptions)
  }, [getTokenOptions, getTokenOptionsVault, tokens, balance])

  const maxHandler = async () => {
    if (!token) return
    const userBalance = balance || token.getTokenBalance()
    const fee = token.getTokenFee()
    const decimals = token.getTokenDecimals()
    if (fee && userBalance && decimals) {
      const balanceNum = new BigNumber(userBalance.toString())
      const feeNum = new BigNumber(fee.toString())
      const val = balanceNum.minus(feeNum)
      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(Number(val), decimals)
      setValue("amount", formattedValue)

      if (setFromUsdAmount) setFromUsdAmount(Number(formattedValue))
    }
  }

  if (!token) return null

  const decimals = token.getTokenDecimals()

  if (!decimals) return null

  return (
    <div
      className={clsx(
        "border rounded-[12px] p-4 h-[100px]",
        error ? "ring border-red-600 ring-red-100" : "border-black",
      )}
    >
      <div className="flex items-center justify-between">
        <InputAmount
          isLoading={false}
          decimals={decimals}
          {...register("amount", {
            required: sumRules.errorMessages.required,
            validate: (value) => {
              if (showLiquidityError) return
              const amountValidationError = validateTransferAmountField(
                balance || token.getTokenBalance(),
                token.getTokenFee(),
                decimals,
              )(value)

              if (amountValidationError) {
                return amountValidationError
              }

              return true
            },
            valueAsNumber: true,
          })}
          onChange={debounce((e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setValue("amount", value)
            if (setFromUsdAmount) setFromUsdAmount(Number(value))
          }, 300)}
        />
        <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
          <ChooseModal
            optionGroups={tokenOptions}
            title="Swap from"
            type="trigger"
            onSelect={(value) => {
              resetField("amount")
              resetField("to")
              setFromChosenToken(value)
            }}
            preselectedValue={token.getTokenAddress()}
            onOpen={sendReceiveTrackingFn}
            isSmooth
            iconClassnames="object-cover h-full rounded-full"
            trigger={
              <div
                id={`token_${token.getTokenName()}_${token.getTokenAddress()}`}
                className="flex items-center cursor-pointer shrink-0"
              >
                <ImageWithFallback
                  alt={token.getTokenName()}
                  fallbackSrc={IconNftPlaceholder}
                  src={`${token.getTokenLogo()}`}
                  className="w-[28px] mr-1.5 rounded-full"
                />
                <p className="text-lg font-semibold">
                  {token.getTokenSymbol()}
                </p>
                <IconCmpArrowRight className="ml-4" />
              </div>
            }
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-right">
        <p className={clsx("text-xs mt-2 text-gray-500 leading-5")}>
          {usdRate || "0.00 USD"}
        </p>
        <div className="mt-2 text-xs leading-5 text-right text-gray-500">
          Balance:&nbsp;
          <span className="cursor-pointer" onClick={maxHandler}>
            {!balance ? (
              <span className="text-teal-600" id="balance">
                {token.getTokenBalanceFormatted() || "0"}&nbsp;
                {token.getTokenSymbol()}
              </span>
            ) : (
              <span className="text-teal-600">{Number(balance) / E8S} ICP</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export const ChooseToToken: FC<ChooseToTokenProps> = ({
  token,
  tokens,
  resetField,
  setToChosenToken,
  sendReceiveTrackingFn,
  usdRate,
  isQuoteLoading,
  register,
  value,
  setValue,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])

  useEffect(() => {
    getTokenOptions(tokens).then(setTokenOptions)
  }, [getTokenOptions, tokens])

  useEffect(() => {
    if (!value) return
    setValue("to", value)
  }, [value])

  if (!token) return null

  const decimals = token.getTokenDecimals()

  if (!decimals) return null
  return (
    <>
      <div className="rounded-[12px] p-4 h-[102px] bg-gray-100">
        <div className="flex items-center justify-between">
          <InputAmount
            decimals={decimals}
            disabled
            isLoading={isQuoteLoading}
            {...register("to")}
          />
          <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
            <ChooseModal
              optionGroups={tokenOptions}
              title="Swap to"
              type="trigger"
              onSelect={(value) => {
                resetField("amount")
                resetField("to")
                setToChosenToken(value)
              }}
              preselectedValue={token.getTokenAddress()}
              onOpen={sendReceiveTrackingFn}
              isSmooth
              iconClassnames="object-cover h-full rounded-full"
              trigger={
                <div
                  id={`token_${token.getTokenName()}_${token.getTokenAddress()}`}
                  className="flex items-center cursor-pointer shrink-0"
                >
                  <ImageWithFallback
                    alt={token.getTokenName()}
                    fallbackSrc={IconNftPlaceholder}
                    src={`${token.getTokenLogo()}`}
                    className="w-[28px] mr-1.5 rounded-full"
                  />
                  <p className="text-lg font-semibold">
                    {token.getTokenSymbol()}
                  </p>
                  <IconCmpArrowRight className="ml-4" />
                </div>
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-right">
          <p className={clsx("text-xs mt-2 text-gray-500 leading-5")}>
            {!isQuoteLoading ? (
              usdRate || "0.00 USD"
            ) : (
              <Skeleton className="w-20 h-1 !bg-gray-200 rounded-[4px]" />
            )}
          </p>
          <div className="mt-2 text-xs leading-5 text-right text-gray-500">
            Balance:&nbsp;
            <span>
              <span>
                {token.getTokenBalanceFormatted() || "0"}&nbsp;
                {token.getTokenSymbol()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
