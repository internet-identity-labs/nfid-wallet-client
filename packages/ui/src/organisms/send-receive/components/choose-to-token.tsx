import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import {
  IconCmpArrowRight,
  IconNftPlaceholder,
} from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { Skeleton } from "packages/ui/src/atoms/skeleton"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { ChooseFtModal, Tooltip } from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { PriceImpactStatus } from "frontend/integration/icpswap/types/enums"
import { PriceImpact } from "frontend/integration/icpswap/types/types"

import { getUserPrincipalId } from "../../tokens/utils"

interface ChooseToTokenProps {
  token: FT | undefined
  tokens: FT[]
  setToChosenToken: (value: string) => void
  usdRate: string | undefined
  isQuoteLoading: boolean
  value?: string
  priceImpact?: PriceImpact
}

export const ChooseToToken: FC<ChooseToTokenProps> = ({
  token,
  tokens,
  setToChosenToken,
  usdRate,
  isQuoteLoading,
  value,
  priceImpact,
}) => {
  const { setValue, register } = useFormContext()
  const [initedToken, setInitedToken] = useState<FT>()

  useEffect(() => {
    setValue("to", value)
  }, [value])

  useEffect(() => {
    if (!token) return
    const init = async () => {
      if (!token.isInited()) {
        const { publicKey } = await getUserPrincipalId()
        const initedToken = await token.init(Principal.fromText(publicKey))
        setInitedToken(initedToken)
      }
    }

    init()
  }, [token])

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
            value={value || ""}
          />
          <div className="p-[6px] bg-[#D1D5DB]/40 rounded-[24px] inline-block">
            <ChooseFtModal
              tokens={tokens}
              title="Swap to"
              onSelect={setToChosenToken}
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
              <>
                {usdRate || "0.00 USD"}&nbsp;
                <Tooltip
                  className="z-[5]"
                  tip={
                    <span>
                      <span>Price impact.</span> The difference between the
                      market <br /> price and your price due to trade size.
                    </span>
                  }
                >
                  {priceImpact?.priceImpact && (
                    <div
                      className={clsx(
                        "inline-block cursor-pointer",
                        priceImpact?.status === PriceImpactStatus.LOW
                          ? "text-green-700"
                          : priceImpact?.status === PriceImpactStatus.MEDIUM
                          ? "text-orange-600"
                          : "text-red-700",
                      )}
                    >
                      ({priceImpact?.priceImpact})
                    </div>
                  )}
                </Tooltip>
              </>
            ) : (
              <Skeleton className="w-20 h-1 !bg-gray-200 rounded-[4px]" />
            )}
          </p>
          <div className="mt-2 text-xs leading-5 text-right text-gray-500">
            Balance:&nbsp;
            <span>
              {initedToken ? (
                <>
                  {initedToken.getTokenBalanceFormatted() || "0"}&nbsp;
                  {initedToken.getTokenSymbol()}
                </>
              ) : (
                <Skeleton className="inline-block h-3 w-[80px]"></Skeleton>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
