import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import { getMaxAmountFee, IModalType } from "../utils"
import {
  BALANCE_EDGE_LENGTH,
  BALANCE_MOBILE_EDGE_LENGTH,
  getIsMobileDeviceMatch,
} from "packages/ui/src/utils/is-mobile"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { SelectedToken } from "frontend/features/transfer-modal/types"

interface ChooseFromTokenProps {
  modalType: IModalType
  id: string
  token: FT | undefined
  tokens?: FT[]
  balance?: bigint | undefined
  value?: string
  setFromChosenToken?: (value: SelectedToken) => void
  usdRate?: string | null
  title: string
  isResponsive?: boolean
  setIsResponsive?: (v: boolean) => void
  tokensAvailableToSwap?: TokensAvailableToSwap
  fee?: bigint
  minAmount?: number
  isLoading?: boolean
  setSkipFeeCalculation?: () => void
  isBtcEthLoading?: boolean
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
  fee,
  minAmount,
  isLoading,
  setSkipFeeCalculation,
  isBtcEthLoading,
}) => {
  const [inputAmountValue, setInputAmountValue] = useState(value || "")
  const [isMaxClicked, setIsMaxClicked] = useState(false)
  const [isFeeLoading, setIsFeeLoading] = useState(false)
  const isChangingToken = useRef(false)

  const {
    setValue,
    register,
    formState: { errors },
    trigger,
    clearErrors,
  } = useFormContext()
  const userBalance = balance !== undefined ? balance : token?.getTokenBalance()
  const decimals = token?.getTokenDecimals()

  useEffect(() => {
    if (!token) return
    isChangingToken.current = true
    setInputAmountValue("")
    setValue("amount", "", { shouldValidate: false })
    clearErrors("amount")
    setSkipFeeCalculation?.()
    setTimeout(() => {
      isChangingToken.current = false
    }, 500)
  }, [token, setValue, clearErrors])

  const feeFormatted = useMemo(() => {
    if (!token || userBalance === undefined) return

    switch (modalType) {
      case IModalType.CONVERT_TO_CKBTC:
        return BigInt(0)
      case IModalType.CONVERT_TO_BTC:
        return BigInt(10)
      case IModalType.CONVERT_TO_ETH:
        return BigInt(10000000000)

      case IModalType.SWAP:
        return fee === undefined ? undefined : getMaxAmountFee(userBalance, fee)

      case IModalType.SEND:
      case IModalType.CONVERT_TO_CKETH:
        return fee

      default:
        return fee
    }
  }, [token, userBalance, modalType, fee])

  useEffect(() => {
    if (
      feeFormatted !== undefined &&
      inputAmountValue.trim() &&
      !isChangingToken.current
    ) {
      trigger("amount")
    }
  }, [feeFormatted, trigger, inputAmountValue])

  const isMaxAvailable = useMemo(() => {
    if (userBalance === undefined) return false

    const isBTC = token?.getChainId() === ChainId.BTC
    const isETH = token?.getChainId() === ChainId.ETH

    if (isBTC || isETH) {
      return userBalance > BigInt(0)
    }
    if (feeFormatted === undefined) return false

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(feeFormatted.toString())
    return balanceNum.minus(feeNum).isGreaterThanOrEqualTo(0)
  }, [userBalance, feeFormatted, token])

  const maxHandler = useCallback(() => {
    if (!token || userBalance === undefined || !isMaxAvailable) return

    const decimals = token.getTokenDecimals()
    if (!decimals) return

    const balanceNum = new BigNumber(userBalance.toString())

    if (token.getChainId() === ChainId.ETH || modalType === IModalType.SEND) {
      const formattedValue = formatAssetAmountRaw(balanceNum, decimals)
      setValue("amount", formattedValue, { shouldValidate: true })

      setIsFeeLoading(true)
      setIsMaxClicked(true)
      return
    }

    if (feeFormatted === undefined) return

    const feeNum = new BigNumber(feeFormatted.toString())
    const maxAmount =
      modalType === IModalType.SWAP ? balanceNum : balanceNum.minus(feeNum)
    const formattedValue = formatAssetAmountRaw(maxAmount, decimals)

    setInputAmountValue(formattedValue)
    setValue("amount", formattedValue, { shouldValidate: true })
  }, [token, feeFormatted, userBalance, isMaxAvailable, setValue])

  useEffect(() => {
    if (
      !isMaxClicked ||
      !token ||
      feeFormatted === undefined ||
      feeFormatted === BigInt(0) ||
      userBalance === undefined
    )
      return

    const decimals = token.getTokenDecimals()
    if (!decimals) return

    const balanceNum = new BigNumber(userBalance.toString())
    const feeNum = new BigNumber(feeFormatted.toString())
    const formattedValue = formatAssetAmountRaw(
      balanceNum.minus(feeNum),
      decimals,
    )

    setSkipFeeCalculation?.()
    setInputAmountValue(formattedValue)
    setValue("amount", formattedValue, { shouldValidate: true })

    setIsFeeLoading(false)
    setIsMaxClicked(false)
  }, [feeFormatted, isMaxClicked, token, userBalance])

  useEffect(() => {
    if (!token || !setIsResponsive) return

    const balance = token.getTokenBalanceFormatted()
    if (
      !balance ||
      balance.length <
        (getIsMobileDeviceMatch() &&
        (token.getChainId() === ChainId.BTC ||
          token.getChainId() === ChainId.ETH ||
          modalType === IModalType.STAKE)
          ? BALANCE_MOBILE_EDGE_LENGTH
          : BALANCE_EDGE_LENGTH)
    ) {
      setIsResponsive(false)
    } else {
      setIsResponsive(true)
    }
  }, [token])

  if (!token || !decimals) return null

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
        {isLoading || !Boolean(token) ? (
          <Skeleton className="w-[124px] h-[34px] rounded-[6px]" />
        ) : (
          <InputAmount
            key={token.getTokenAddress()}
            className={clsx(
              isResponsive && "leading-[26px] h-[30px] !max-w-full",
            )}
            id={"choose-from-token-amount"}
            isLoading={isFeeLoading}
            decimals={decimals}
            value={inputAmountValue}
            {...register("amount", {
              onChange: (e) => setInputAmountValue(e.target.value),
              validate: (value) => {
                if (isChangingToken.current) {
                  return true
                }

                if (!value || !token) {
                  return sumRules.errorMessages.required
                }

                const amountValidationError = validateTransferAmountField(
                  balance || token.getTokenBalance(),
                  modalType === IModalType.SWAP ? BigInt(0) : feeFormatted,
                  decimals,
                  modalType === IModalType.CONVERT_TO_BTC,
                  modalType === IModalType.CONVERT_TO_ETH,
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
              searchInputId={
                modalType === IModalType.SEND ||
                modalType === IModalType.SWAP ||
                modalType === IModalType.STAKE
                  ? "sourceTokenSearchInput"
                  : undefined
              }
              modalType={modalType}
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
              isBtcEthLoading={isBtcEthLoading}
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
        {isLoading || isFeeLoading || !Boolean(token) ? (
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
                {token ? (
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
