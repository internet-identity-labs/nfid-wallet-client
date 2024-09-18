import BigNumber from "bignumber.js"
import clsx from "clsx"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { formatAssetAmountRaw } from "packages/ui/src/molecules/ticker-amount"
import { FC, useCallback, useEffect, useState } from "react"
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
  IconCmpArrow,
  Skeleton,
} from "@nfid-frontend/ui"
import { validateTransferAmountField } from "@nfid-frontend/utils"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { AccountBalance } from "frontend/features/fungible-token/fetch-balances"
import { FT } from "frontend/integration/ft/ft"

interface ChooseFromTokenProps {
  error: FieldError | undefined
  token: FT | undefined
  tokens: FT[]
  isVault?: boolean
  register: UseFormRegister<{
    amount: string
    to: string
  }>
  vaultsBalance?: AccountBalance | undefined
  setAmountInUSD: (value: number) => void
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
  setChosenToken: (value: string) => void
  sendReceiveTrackingFn?: () => void
  usdRate: string | undefined
  setValue: UseFormSetValue<{
    amount: string
    to: string
  }>
}

interface ChooseToTokenProps {
  token: FT | undefined
  tokens: FT[]
  isVault?: boolean
  vaultsBalance?: AccountBalance | undefined
  setAmountInUSD: (value: number) => void
  resetField: UseFormResetField<{
    amount: string
    to: string
  }>
  setChosenToken: (value: string) => void
  sendReceiveTrackingFn?: () => void
  usdRate: string | undefined
  toTokenChosen: string
  setToTokenChosen: (value: string) => void
  isPairFetched: boolean
}

export const ChooseFromToken: FC<ChooseFromTokenProps> = ({
  error,
  token,
  tokens,
  isVault,
  register,
  vaultsBalance,
  setAmountInUSD,
  resetField,
  setChosenToken,
  sendReceiveTrackingFn,
  usdRate,
  setValue,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])

  const getTokenOptions = useCallback(async () => {
    const options = await Promise.all(
      tokens.map(async (token) => {
        const usdBalance = await token.getTokenRate(
          token.getTokenBalanceFormatted() || "0",
        )

        return {
          label: "Internet Computer",
          options: [
            {
              icon: token.getTokenLogo(),
              value: token.getTokenAddress(),
              title: token.getTokenSymbol(),
              subTitle: token.getTokenName(),
              innerTitle: `${
                token.getTokenBalanceFormatted() || 0
              } ${token.getTokenSymbol()}`,
              innerSubtitle:
                usdBalance === undefined
                  ? "Not listed"
                  : usdBalance === 0
                  ? "0.00 USD"
                  : `${usdBalance.toString()} USD`,
            },
          ],
        }
      }),
    )

    return isVault
      ? options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
      : options
  }, [tokens, isVault])

  useEffect(() => {
    getTokenOptions().then(setTokenOptions)
  }, [getTokenOptions])

  const maxHandler = async () => {
    if (!token) return
    const fee = token.getTokenFee()
    if (fee && token.getTokenBalance()) {
      const balanceNum =
        isVault && vaultsBalance
          ? new BigNumber(vaultsBalance.balance["ICP"].toString())
          : new BigNumber(token.getTokenBalance()!.toString())
      const feeNum = new BigNumber(fee.toString())
      const val = balanceNum.minus(feeNum)
      if (val.isLessThanOrEqualTo(0)) return

      const formattedValue = formatAssetAmountRaw(
        Number(val),
        token.getTokenDecimals()!,
      )

      setValue("amount", formattedValue)
      setAmountInUSD(Number(formattedValue))
    }
  }

  if (!token) return null

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
          decimals={token.getTokenDecimals()!}
          {...register("amount", {
            required: sumRules.errorMessages.required,
            validate: validateTransferAmountField(
              formatAssetAmountRaw(
                isVault && vaultsBalance
                  ? Number(vaultsBalance.balance["ICP"])
                  : Number(token.getTokenBalance()),
                token.getTokenDecimals()!,
              ),
              formatAssetAmountRaw(
                Number(token.getTokenFee()),
                token.getTokenDecimals()!,
              ),
            ),
            valueAsNumber: true,
            onChange: (e) => {
              setAmountInUSD(Number(e.target.value))
            },
          })}
        />
        <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
          <ChooseModal
            optionGroups={tokenOptions}
            title="Swap from"
            type="trigger"
            onSelect={(value) => {
              resetField("amount")
              resetField("to")
              setAmountInUSD(0)
              setChosenToken(value)
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
          {usdRate}
        </p>
        <div className="mt-2 text-xs leading-5 text-right text-gray-500">
          Balance:&nbsp;
          <span className="cursor-pointer" onClick={maxHandler}>
            {!isVault ? (
              <span className="text-teal-600" id="balance">
                {token.getTokenBalanceFormatted() || "0"}&nbsp;
                {token.getTokenSymbol()}
              </span>
            ) : (
              <span className="text-teal-600">
                {Number(vaultsBalance?.balance["ICP"]) / E8S} ICP
              </span>
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
  isVault,
  vaultsBalance,
  setAmountInUSD,
  resetField,
  setChosenToken,
  sendReceiveTrackingFn,
  usdRate,
  toTokenChosen,
  setToTokenChosen,
  isPairFetched,
}) => {
  const [tokenOptions, setTokenOptions] = useState<IGroupedOptions[]>([])

  const getTokenOptions = useCallback(async () => {
    const options = await Promise.all(
      tokens.map(async (token) => {
        const usdBalance = await token.getTokenRate(
          token.getTokenBalanceFormatted() || "0",
        )

        return {
          label: "Internet Computer",
          options: [
            {
              icon: token.getTokenLogo(),
              value: token.getTokenAddress(),
              title: token.getTokenSymbol(),
              subTitle: token.getTokenName(),
              innerTitle: `${
                token.getTokenBalanceFormatted() || 0
              } ${token.getTokenSymbol()}`,
              innerSubtitle:
                usdBalance === undefined
                  ? "Not listed"
                  : usdBalance === 0
                  ? "0.00 USD"
                  : `${usdBalance.toString()} USD`,
            },
          ],
        }
      }),
    )

    return isVault
      ? options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
      : options
  }, [tokens, isVault])

  useEffect(() => {
    getTokenOptions().then(setTokenOptions)
  }, [getTokenOptions])

  if (!token) return null
  return (
    <>
      <div className="rounded-[12px] p-4 h-[102px] bg-gray-100">
        <div className="flex items-center justify-between">
          <InputAmount
            decimals={token.getTokenDecimals()!}
            disabled
            isLoading={!isPairFetched}
          />
          <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
            <ChooseModal
              optionGroups={tokenOptions}
              title="Swap to"
              type="trigger"
              onSelect={(value) => {
                resetField("amount")
                resetField("to")
                setAmountInUSD(0)
                setToTokenChosen(value)
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
            {isPairFetched ? (
              usdRate
            ) : (
              <Skeleton className="w-20 h-1 !bg-gray-200 rounded-[4px]" />
            )}
          </p>
          <div className="mt-2 text-xs leading-5 text-right text-gray-500">
            Balance:&nbsp;
            <span>
              {!isVault ? (
                <span>
                  {token.getTokenBalanceFormatted() || "0"}&nbsp;
                  {token.getTokenSymbol()}
                </span>
              ) : (
                <span className="text-teal-600">
                  {Number(vaultsBalance?.balance["ICP"]) / E8S} ICP
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
