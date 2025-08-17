import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
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
import {
  BTC_NATIVE_ID,
  E8S,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { useTokenInit } from "../hooks/token-init"
import { getMaxAmountFee, IModalType } from "../utils"
import { BALANCE_EDGE_LENGTH } from "./swap-form"

interface ChooseFromTokenProps {
  modalType: IModalType
  id: string
  token: FT | undefined
  tokens?: FT[]
  balance?: bigint | undefined
  value?: string
  setFromChosenToken?: (value: string) => void
  usdRate?: string
  title: string
  isResponsive?: boolean
  setIsResponsive?: (v: boolean) => void
  tokensAvailableToSwap?: TokensAvailableToSwap
  btcFee?: bigint
  ethFee?: bigint
  minAmount?: number
  isLoading?: boolean
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  modalType,
  id,
  token,
  tokens,
  balance,
  value,
  setFromChosenToken,
  usdRate = "0.00 USD",
  title,
  isResponsive,
  setIsResponsive,
  tokensAvailableToSwap,
  btcFee,
  ethFee,
  minAmount,
  isLoading,
}) => {
  const [inputAmountValue, setInputAmountValue] = useState(value || "")
  const [isMaxClicked, setIsMaxClicked] = useState(false)
  const [isBtcLoading, setIsBtcLoading] = useState(false)

  const initedToken = useTokenInit(token)

  const {
    setValue,
    register,
    formState: { errors },
    trigger,
  } = useFormContext()
  const userBalance = balance !== undefined ? balance : token!.getTokenBalance()
  const decimals = token!.getTokenDecimals()

  useEffect(() => {
    if (token && inputAmountValue.trim()) {
      trigger("amount")
    }
  }, [token, inputAmountValue])

  const fee = useMemo(() => {
    if (!token || userBalance === undefined) return
    return modalType === IModalType.SWAP
      ? getMaxAmountFee(userBalance, token.getTokenFee())
      : modalType === IModalType.STAKE ||
        (modalType === IModalType.SEND &&
          token.getTokenAddress() === BTC_NATIVE_ID)
      ? btcFee
      : modalType === IModalType.SEND &&
        token.getTokenAddress() === ETH_NATIVE_ID
      ? ethFee
      : token.getTokenFee()
  }, [token, userBalance, btcFee])

  const isMaxAvailable = useMemo(() => {
    if (
      modalType === IModalType.CONVERT_TO_CKBTC ||
      modalType === IModalType.CONVERT_TO_BTC ||
      (modalType === IModalType.SEND &&
        token?.getTokenAddress() === BTC_NATIVE_ID) ||
      token?.getTokenAddress() === ETH_NATIVE_ID
    )
      return false

    if (
      userBalance === undefined ||
      (token?.getTokenAddress() !== BTC_NATIVE_ID && fee === undefined) ||
      (token?.getTokenAddress() === BTC_NATIVE_ID &&
        userBalance === BigInt(0)) ||
      (token?.getTokenAddress() !== ETH_NATIVE_ID && fee === undefined)
    )
      return false

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee!.toString())
    return balanceNum.minus(feeNum).isGreaterThanOrEqualTo(0)
  }, [userBalance, fee, token])

  const maxHandler = useCallback(() => {
    if (!token || userBalance === undefined || !isMaxAvailable) return

    const decimals = token.getTokenDecimals()
    if (!decimals) return

    const balanceNum = new BigNumber(userBalance.toString())

    if (token.getTokenAddress() === BTC_NATIVE_ID) {
      const formattedValue = formatAssetAmountRaw(balanceNum, decimals)
      setValue("amount", formattedValue, { shouldValidate: true })

      setIsBtcLoading(true)
      setIsMaxClicked(true)
      return
    }

    if (fee === undefined) return

    const feeNum = new BigNumber(fee.toString())
    const maxAmount =
      modalType === IModalType.SWAP ? balanceNum : balanceNum.minus(feeNum)
    const formattedValue = formatAssetAmountRaw(maxAmount, decimals)

    setInputAmountValue(formattedValue)
    setValue("amount", formattedValue, { shouldValidate: true })
  }, [token, fee, userBalance, isMaxAvailable, setValue])

  useEffect(() => {
    if (
      !isMaxClicked ||
      !token ||
      token.getTokenAddress() !== BTC_NATIVE_ID ||
      fee === undefined ||
      userBalance === undefined
    )
      return

    const decimals = token.getTokenDecimals()
    if (!decimals) return

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(fee.toString())
    const maxAmount =
      modalType === IModalType.SWAP ? balanceNum : balanceNum.minus(feeNum)
    const formattedValue = formatAssetAmountRaw(maxAmount, decimals)

    setInputAmountValue(formattedValue)
    setValue("amount", formattedValue, { shouldValidate: true })

    setIsBtcLoading(false)
    setIsMaxClicked(false)
  }, [fee, isMaxClicked, token, userBalance])

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
        "border rounded-[12px] p-4 dark:bg-[#FFFFFF0D]",
        errors["amount"]
          ? "ring border-red-600 dark:border-red-500 ring-red-100"
          : "border-black dark:border-zinc-500",
        isResponsive ? "h-[168px]" : "h-[100px]",
      )}
    >
      <div className="flex flex-wrap justify-between">
        {isLoading || !Boolean(initedToken) ? (
          <Skeleton className="w-[124px] h-[34px] rounded-[6px]" />
        ) : (
          <InputAmount
            className={clsx(
              isResponsive && "leading-[26px] h-[30px] !max-w-full",
            )}
            id={"choose-from-token-amount"}
            isLoading={isBtcLoading}
            decimals={decimals}
            value={inputAmountValue}
            {...register("amount", {
              required: sumRules.errorMessages.required,
              onChange: (e) => setInputAmountValue(e.target.value),
              validate: (value) => {
                const amountValidationError = validateTransferAmountField(
                  balance || token.getTokenBalance(),
                  modalType === IModalType.SWAP
                    ? BigInt(0)
                    : token.getTokenFee(),
                  decimals,
                  modalType === IModalType.CONVERT_TO_BTC,
                  minAmount,
                  token.getTokenSymbol(),
                )(value)

                return amountValidationError ?? true
              },
            })}
          />
        )}
        <div
          className={clsx(
            "py-[6px] pl-[6px] pr-[12px] bg-gray-300/40 dark:bg-[#E5E7EB1A] rounded-[24px] inline-block",
            isResponsive && "w-full flex-[0_0_100%] order-1 mt-2",
          )}
        >
          {tokens !== undefined && setFromChosenToken ? (
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
                  <IconCmpArrowRight className="ml-auto dark:text-white" />
                </div>
              }
              tokensAvailableToSwap={tokensAvailableToSwap}
            />
          ) : (
            <div className="flex items-center w-full gap-1.5">
              <ImageWithFallback
                alt={token.getTokenName()}
                fallbackSrc={IconNftPlaceholder}
                src={`${token.getTokenLogo()}`}
                className="w-[28px] rounded-full"
              />
              <p className="text-lg font-semibold">{token.getTokenSymbol()}</p>
            </div>
          )}
        </div>
        <div className="flex-[0_0_100%]"></div>
        {isLoading || isBtcLoading || !Boolean(initedToken) ? (
          <Skeleton className="w-[124px] h-1 rounded-[6px] mt-[15px]" />
        ) : (
          <p
            className={clsx(
              "text-xs mt-2 text-gray-500 dark:text-zinc-400 leading-5 text-left",
            )}
          >
            {usdRate || "0.00 USD"}
          </p>
        )}
        <div
          className={clsx(
            "mt-2 text-xs leading-5 text-gray-500 dark:text-zinc-400",
            isResponsive ? "flex-[0_0_100%] order-2" : "text-right",
          )}
        >
          Balance:&nbsp;
          <span
            className={clsx(
              isMaxAvailable
                ? "text-teal-600 dark:text-teal-500 cursor-pointer"
                : "text-gray-500 dark:text-zinc-400",
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
