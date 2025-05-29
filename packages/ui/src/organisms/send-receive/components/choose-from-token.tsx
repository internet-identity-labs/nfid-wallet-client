import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { getMaxAmountFee } from "src/integration/swap/icpswap/util/util"

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
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { useTokenInit } from "../hooks/token-init"
import { BALANCE_EDGE_LENGTH } from "./swap-form"

interface ChooseFromTokenProps {
  id: string,
  token: FT | undefined
  tokens: FT[]
  balance?: bigint | undefined
  value?: string
  setFromChosenToken: (value: string) => void
  usdRate?: string
  title: string
  isSwap?: boolean
  isResponsive?: boolean
  setIsResponsive?: (v: boolean) => void
  tokensAvailableToSwap?: TokensAvailableToSwap
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  id,
  token,
  tokens,
  balance,
  value,
  setFromChosenToken,
  usdRate = "0.00 USD",
  title,
  isSwap = false,
  isResponsive,
  setIsResponsive,
  tokensAvailableToSwap,
}) => {
  const [inputAmountValue, setInputAmountValue] = useState(value || "")

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

  useEffect(() => {
    if (!initedToken || !setIsResponsive) return

    const balance = initedToken.getTokenBalanceFormatted()
    if (!balance || balance.length < BALANCE_EDGE_LENGTH) {
      setIsResponsive(false)
    } else {
      setIsResponsive(true)
    }
  }, [initedToken])

  if (!decimals || !token) return null

  return (
    <div
      id={"sourceSection"}
      className={clsx(
        "border rounded-[12px] p-4",
        errors["amount"] ? "ring border-red-600 ring-red-100" : "border-black",
        isResponsive ? "h-[168px]" : "h-[100px]",
      )}
    >
      <div className="flex flex-wrap justify-between">
        <InputAmount
          className={clsx(
            isResponsive && "leading-[26px] h-[30px] !max-w-full",
          )}
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
        <div
          className={clsx(
            "py-[6px] pl-[6px] pr-[12px] bg-gray-300/40 rounded-[24px] inline-block",
            isResponsive && "w-full flex-[0_0_100%] order-1 mt-2",
          )}
        >
          <ChooseFtModal
            id={id}
            searchInputId={"sourceTokenSearchInput"}
            tokens={tokens}
            title={title}
            onSelect={setFromChosenToken}
            trigger={
              <div
                id={`sourceToken_${token.getTokenName()}_${token.getTokenAddress()}`}
                className="flex items-center w-full cursor-pointer gap-1.5"
              >
                <ImageWithFallback
                  alt={token.getTokenName()}
                  fallbackSrc={IconNftPlaceholder}
                  src={`${token.getTokenLogo()}`}
                  className="w-[28px] rounded-full"
                />
                <p className="text-lg font-semibold">
                  {token.getTokenSymbol()}
                </p>
                <IconCmpArrowRight className="ml-auto" />
              </div>
            }
            tokensAvailableToSwap={tokensAvailableToSwap}
          />
        </div>
        <div className="flex-[0_0_100%]"></div>
        <p className={clsx("text-xs mt-2 text-gray-500 leading-5 text-left")}>
          {usdRate || "0.00 USD"}
        </p>
        <div
          className={clsx(
            "mt-2 text-xs leading-5 text-gray-500",
            isResponsive ? "flex-[0_0_100%] order-2" : "text-right",
          )}
        >
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
