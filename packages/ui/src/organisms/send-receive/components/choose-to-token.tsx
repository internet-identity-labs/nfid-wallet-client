import clsx from "clsx"
import {
  IconCmpArrowRight,
  IconNftPlaceholder,
} from "packages/ui/src/atoms/icons"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { Skeleton } from "packages/ui/src/atoms/skeleton"
import { InputAmount } from "packages/ui/src/molecules/input-amount"
import { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { PriceImpactStatus } from "src/integration/swap/types/enums"
import { PriceImpact } from "src/integration/swap/types/types"

import { ChooseFtModal, Tooltip } from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"
import { BALANCE_EDGE_LENGTH } from "./convert-form"
import {
  BALANCE_MOBILE_EDGE_LENGTH,
  getIsMobileDeviceMatch,
} from "packages/ui/src/utils/is-mobile"

interface ChooseToTokenProps {
  token: FT | undefined
  tokens?: FT[]
  setToChosenToken: (value: string) => void
  usdRate: string | undefined | null
  isLoading: boolean
  value?: string
  priceImpact?: PriceImpact
  isResponsive?: boolean
  setIsResponsive?: (v: boolean) => void
  tokensAvailableToSwap?: TokensAvailableToSwap
  color?: string
}

export const ChooseToToken: FC<ChooseToTokenProps> = ({
  token,
  tokens,
  setToChosenToken,
  usdRate,
  isLoading,
  value,
  priceImpact,
  isResponsive,
  setIsResponsive,
  tokensAvailableToSwap,
  color = "bg-gray-100 dark:bg-zinc-700",
}) => {
  const { setValue, register } = useFormContext()

  useEffect(() => {
    setValue("to", value)
  }, [value])

  useEffect(() => {
    if (!token || !setIsResponsive) return

    const balance = token.getTokenBalanceFormatted()
    if (
      !balance ||
      balance.length <
        (getIsMobileDeviceMatch()
          ? BALANCE_MOBILE_EDGE_LENGTH
          : BALANCE_EDGE_LENGTH)
    ) {
      setIsResponsive(false)
    } else {
      setIsResponsive(true)
    }
  }, [token])

  if (!token) return null

  const decimals = token.getTokenDecimals()

  if (!decimals) return null
  return (
    <>
      <div
        id={"targetSection"}
        className={clsx(
          "rounded-[12px] p-4 dark:border-zinc-500 dark:border-0",
          isResponsive ? "h-[168px]" : "h-[102px]",
          color,
        )}
      >
        <div className="flex flex-wrap justify-between">
          <InputAmount
            skeletonClassName="dark:!bg-zinc-600"
            className={clsx(
              isResponsive &&
                "leading-[26px] h-[30px] !max-w-full flex-[0_0_100%]",
              "dark:text-zinc-400 dark:placeholder:text-zinc-400",
            )}
            id={"choose-to-token-amount"}
            decimals={decimals}
            disabled
            isLoading={isLoading}
            {...register("to")}
            value={value || ""}
          />
          <div
            className={clsx(
              "p-[6px] pr-[12px] bg-gray-300/40 dark:bg-[#E5E7EB1A] rounded-[24px] inline-block",
              isResponsive && "w-full flex-[0_0_100%] order-1 mt-2",
            )}
          >
            {tokens !== undefined && setToChosenToken ? (
              <ChooseFtModal
                id="ft-modal"
                searchInputId={"targetTokenSearchInput"}
                tokens={tokens}
                title="Swap to"
                onSelect={setToChosenToken}
                isSwapTo={true}
                trigger={
                  <div
                    id={`targetToken_${token.getTokenName()}_${token.getTokenAddress()}`}
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
            ) : (
              <div className="flex items-center w-full cursor-pointer gap-1.5">
                <ImageWithFallback
                  alt={token.getTokenName()}
                  fallbackSrc={IconNftPlaceholder}
                  src={`${token.getTokenLogo()}`}
                  className="w-[28px] rounded-full"
                />
                <p className="text-lg font-semibold">
                  {token.getTokenSymbol()}
                </p>
              </div>
            )}
          </div>
          <div className="flex-[0_0_100%]"></div>
          <p
            className={clsx(
              "text-xs mt-2 text-gray-500 dark:text-zinc-400 leading-5 text-left",
            )}
          >
            {!isLoading ? (
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
                          ? "text-green-700 dark:text-teal-500"
                          : priceImpact?.status === PriceImpactStatus.MEDIUM
                            ? "text-orange-600 dark:text-amber-500"
                            : "text-red-700 dark:text-red-500",
                      )}
                    >
                      ({priceImpact?.priceImpact})
                    </div>
                  )}
                </Tooltip>
              </>
            ) : (
              <Skeleton className="w-20 h-1 !bg-gray-200 dark:!bg-zinc-600 rounded-[4px]" />
            )}
          </p>
          <div
            className={clsx(
              "mt-2 text-xs leading-5 text-gray-500 dark:text-zinc-400",
              isResponsive ? "flex-[0_0_100%] order-2" : "text-right",
            )}
          >
            Balance:&nbsp;
            <span id={"choose-to-token-balance"}>
              {token ? (
                <>
                  {token.getTokenBalanceFormatted() || "0"}&nbsp;
                  {token.getTokenSymbol()}
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
