import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useEffect, useState } from "react"
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

import { getTokenOptions, getTokenOptionsVault } from "../utils"

interface ChooseFromTokenProps {
  token: FT | undefined
  tokens: FT[]
  balance?: bigint | undefined
  sendReceiveTrackingFn?: () => void
  setFromChosenToken: (value: string) => void
  usdRate: string | undefined
  title: string
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  token,
  tokens,
  balance,
  setFromChosenToken,
  sendReceiveTrackingFn,
  usdRate,
  title,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])
  const [isTokenOptionsLoading, setIsTokenOptionsLoading] = useState(true)

  useEffect(() => {
    balance !== undefined
      ? getTokenOptionsVault(tokens)
      : getTokenOptions(tokens)
          .then(setTokenOptions)
          .finally(() => setIsTokenOptionsLoading(false))
  }, [getTokenOptions, getTokenOptionsVault, tokens, balance])

  const maxHandler = async () => {
    if (!token) return
    const userBalance = balance || token.getTokenBalance()
    const fee = token.getTokenFee()
    const decimals = token.getTokenDecimals()
    if (fee !== undefined && userBalance && decimals) {
      const balanceNum = new BigNumber(userBalance.toString())
      const feeNum = new BigNumber(fee.toString())
      const val = balanceNum.minus(feeNum)
      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(Number(val), decimals)
      setValue("amount", formattedValue, {
        shouldValidate: true,
      })
    }
  }

  const {
    resetField,
    setValue,
    register,
    formState: { errors },
  } = useFormContext()

  if (!token) return null

  const decimals = token.getTokenDecimals()

  if (!decimals) return null

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
                token.getTokenFee(),
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
