import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"

import {
  IconCmpArrowRight,
  sumRules,
  ImageWithFallback,
  IconNftPlaceholder,
  ChooseFtModal,
  Skeleton,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { getMaxAmountFee } from "src/integration/swap/icpswap/util/util"

import { useTokenInit } from "../hooks/token-init"

interface ChooseFromTokenProps {
  token: FT | undefined
  tokens: FT[]
  balance?: bigint | undefined
  setFromChosenToken: (value: string) => void
  usdRate: string | undefined
  title: string
  isSwap?: boolean
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  token,
  tokens,
  balance,
  setFromChosenToken,
  usdRate,
  title,
  isSwap = false,
}) => {
  const [inputAmountValue, setInputAmountValue] = useState("")

  const initedToken = useTokenInit(token)

  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext()
  const userBalance = balance !== undefined ? balance : token!.getTokenBalance()
  const decimals = token!.getTokenDecimals()

  const fee = useMemo(() => {
    if (!token || userBalance === undefined) return
    return isSwap
      ? getMaxAmountFee(userBalance, token.getTokenFee())
      : token.getTokenFee()
  }, [token, userBalance, isSwap])

  const isMaxAvailable = useMemo(() => {
    if (userBalance === undefined || fee === undefined) return false

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee.toString())
    return balanceNum.minus(feeNum).isGreaterThanOrEqualTo(0)
  }, [userBalance, fee, token])

  const maxHandler = useCallback(() => {
    if (!token || fee === undefined || userBalance === undefined) return
    const decimals = token.getTokenDecimals()
    if (!decimals || !isMaxAvailable) return
    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee.toString())
    const maxAmount = isSwap ? balanceNum : balanceNum.minus(feeNum)
    const formattedValue = formatAssetAmountRaw(maxAmount, decimals)
    setInputAmountValue(formattedValue)

    setValue("amount", formattedValue, { shouldValidate: true })
  }, [token, fee, userBalance, isMaxAvailable, setValue])

  if (!decimals || !token) return null

  return (
    <div
      id={"sourceSection"}
      className={clsx(
        "border rounded-[12px] p-4 h-[100px]",
        errors["amount"] ? "ring border-red-600 ring-red-100" : "border-black",
      )}
    >
      <div className="flex items-center justify-between">
        <InputAmount
          id={"choose-from-token-amount"}
          disabled={!Boolean(initedToken)}
          isLoading={false}
          decimals={decimals}
          value={inputAmountValue}
          {...register("amount", {
            required: sumRules.errorMessages.required,
            onChange: (e) => setInputAmountValue(e.target.value),
            validate: (value) => {
              const amountValidationError = validateTransferAmountField(
                balance || token.getTokenBalance(),
                isSwap ? BigInt(0) : token.getTokenFee(),
                decimals,
              )(value)

              return amountValidationError ?? true
            },
          })}
        />
        <div className="py-[6px] pl-[6px] pr-[12px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
          <ChooseFtModal
            searchInputId={"sourceTokenSearchInput"}
            tokens={tokens}
            title={title}
            onSelect={setFromChosenToken}
            trigger={
              <div
                id={`sourceToken_${token.getTokenName()}_${token.getTokenAddress()}`}
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
          <span
            className={clsx(
              isMaxAvailable ? "text-teal-600 cursor-pointer" : "text-gray-500",
            )}
            onClick={maxHandler}
          >
            {balance === undefined ? (
              <span id="choose-from-token-balance">
                {initedToken ? (
                  <>
                    {initedToken.getTokenBalanceFormatted() || "0"}&nbsp;
                    {initedToken.getTokenSymbol()}
                  </>
                ) : (
                  <Skeleton className="inline-block h-3 w-[80px]"></Skeleton>
                )}
              </span>
            ) : (
              <span>{Number(balance) / E8S} ICP</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
