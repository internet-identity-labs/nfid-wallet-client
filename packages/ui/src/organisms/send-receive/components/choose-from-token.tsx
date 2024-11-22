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
import { getMaxAmountFee } from "frontend/integration/icpswap/util/util"

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
    const formattedValue = formatAssetAmountRaw(Number(maxAmount), decimals)
    setInputAmountValue(formattedValue)

    setValue("amount", formattedValue, { shouldValidate: true })
  }, [token, fee, userBalance, isMaxAvailable, setValue])

  if (!decimals || !token) return null

  return (
    <div
      className={clsx(
        "border rounded-[12px] p-4 h-[100px]",
        errors["amount"] ? "ring border-red-600 ring-red-100" : "border-black",
      )}
    >
      <div className="flex items-center justify-between">
        <InputAmount
          isLoading={false}
          decimals={decimals}
          value={inputAmountValue}
          {...register("amount", {
            required: sumRules.errorMessages.required,
            onChange: (e) => setInputAmountValue(e.target.value),
            validate: (value) => {
              const amountValidationError = validateTransferAmountField(
                balance || token.getTokenBalance(),
                isSwap
                  //all fees are included
                  ? BigInt(0)
                  : token.getTokenFee(),
                decimals,
              )(value)

              return amountValidationError ?? true
            },
          })}
        />
        <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
          <ChooseFtModal
            tokens={tokens}
            title={title}
            onSelect={setFromChosenToken}
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
          <span
            className={clsx(
              isMaxAvailable ? "text-teal-600 cursor-pointer" : "text-gray-500",
            )}
            onClick={maxHandler}
          >
            {balance === undefined ? (
              <span id="balance">
                {token.isInited() ? (
                  <>
                    {token.getTokenBalanceFormatted() || "0"}&nbsp;
                    {token.getTokenSymbol()}
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
