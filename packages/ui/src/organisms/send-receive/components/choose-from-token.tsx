import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"

import {
  ChooseModal,
  IconCmpArrowRight,
  sumRules,
  IGroupedOptions,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { getMaxAmountFee } from "frontend/integration/icpswap/util/util"

import { getTokenOptions, getTokenOptionsVault } from "../utils"

interface ChooseFromTokenProps {
  token: FT | undefined
  tokens: FT[]
  balance?: bigint | undefined
  sendReceiveTrackingFn?: () => void
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
  sendReceiveTrackingFn,
  usdRate,
  title,
  isSwap = false,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(false)

  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext()

  const userBalance = balance || token!.getTokenBalance()
  const decimals = token!.getTokenDecimals()

  useEffect(() => {
    setIsTokenOptionsLoading(true)
    const fetchOptions = balance ? getTokenOptionsVault : getTokenOptions

    fetchOptions(tokens)
      .then(setTokenOptions)
      .finally(() => setIsTokenOptionsLoading(false))
  }, [tokens, balance])

  const fee = useMemo(() => {
    if (!token || !userBalance) return
    return isSwap
      ? getMaxAmountFee(userBalance, token.getTokenFee())
      : token.getTokenFee()
  }, [token, userBalance, isSwap])

  const checkBalance = useCallback(() => {
    if (!userBalance || !fee) return false
    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee.toString())
    return balanceNum.minus(feeNum).isGreaterThan(0)
  }, [userBalance, fee])

  const maxHandler = useCallback(() => {
    if (!token || !fee || !userBalance) return
    const decimals = token.getTokenDecimals()
    if (!decimals || !checkBalance()) return

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee.toString())
    const maxAmount = balanceNum.minus(feeNum)
    const formattedValue = formatAssetAmountRaw(Number(maxAmount), decimals)

    setValue("amount", formattedValue, { shouldValidate: true })
  }, [token, fee, userBalance, checkBalance, setValue])

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
          {...register("amount", {
            required: sumRules.errorMessages.required,
            validate: (value) => {
              const amountValidationError = validateTransferAmountField(
                balance || token.getTokenBalance(),
                isSwap
                  ? getMaxAmountFee(
                      token.getTokenBalance()!,
                      token.getTokenFee(),
                    )
                  : token.getTokenFee(),
                decimals,
              )(value)

              return amountValidationError ?? true
            },
          })}
        />
        <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
          <ChooseModal
            isLoading={isTokenOptionsLoading}
            optionGroups={tokenOptions}
            title={title}
            type="trigger"
            onSelect={setFromChosenToken}
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
          <span
            className={clsx(
              checkBalance() ? "text-teal-600 cursor-pointer" : "text-gray-500",
            )}
            onClick={maxHandler}
          >
            {!balance ? (
              <span id="balance">
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
