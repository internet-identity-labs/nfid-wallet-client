import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { FC, useState } from "react"
import { FieldErrors, FieldValues } from "react-hook-form"
import { Id } from "react-toastify"
import { Quote } from "src/integration/swap/quote"

import {
  Button,
  IconCmpArrow,
  Checkbox,
  IconCmpSwap,
  Tooltip,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"

import SwapArrowBox from "../assets/swap-arrow-box.png"
import SettingsIcon from "../assets/swap-settings.svg"
import { ChooseFromToken } from "./choose-from-token"
import { ChooseToToken } from "./choose-to-token"
import { SwapModal } from "./swap"

export const BALANCE_EDGE_LENGTH = 20

export interface SwapFTFormProps {
  tokens: FT[]
  allTokens: FT[]
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => Promise<void | Id>
  setFromChosenToken: (value: string) => void
  setToChosenToken: (value: string) => void
  showLiquidityError: Error | undefined
  slippageQuoteError: string | undefined
  isQuoteLoading: boolean
  quote: Quote | undefined
  quoteTimer: number
  isOpen: boolean
  setSwapModal: (v: SwapModal) => void
  amount: string
  errors: FieldErrors<FieldValues>
  tokensAvailableToSwap: TokensAvailableToSwap
}

export const SwapFTForm: FC<SwapFTFormProps> = ({
  tokens,
  allTokens,
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,
  showLiquidityError,
  slippageQuoteError,
  isQuoteLoading,
  quote,
  quoteTimer,
  isOpen,
  setSwapModal,
  amount,
  errors,
  tokensAvailableToSwap,
}) => {
  const [isChecked, setIsChecked] = useState(false)
  const [rebuildFromLayout, setRebuildFromLayout] = useState(false)
  const [rebuildToLayout, setRebuildToLayout] = useState(false)
  const priceImpact = quote?.getPriceImpact()

  return (
    <div
      className={clsx(
        !isOpen && "hidden",
        priceImpact?.status === "high" && "pb-[64px]",
      )}
    >
      <div>
        <div
          className={clsx(
            "leading-10 text-[20px] font-bold mb-[18px]",
            "flex justify-between items-center",
          )}
        >
          <span>Swap</span>
          {isOpen && (
            <Tooltip
              align="end"
              alignOffset={-20}
              tip={<span className="block max-w-[300px]">Swap parameters</span>}
            >
              <img
                className="cursor-pointer hover:opacity-60"
                src={SettingsIcon}
                alt="NFID swap settings"
                onClick={() => setSwapModal(SwapModal.SETTINGS)}
              />
            </Tooltip>
          )}
        </div>
        <p className="mb-1 text-xs">From</p>
        <ChooseFromToken
          token={fromToken}
          setFromChosenToken={setFromChosenToken}
          usdRate={quote?.getSourceAmountUSD()}
          tokens={tokens}
          title="Swap from"
          isSwap={true}
          rebuildLayout={rebuildFromLayout || rebuildToLayout}
          setRebuildLayout={setRebuildFromLayout}
          tokensAvailableToSwap={tokensAvailableToSwap}
        />
        {showLiquidityError ? (
          <div className="h-4 mt-1 text-xs leading-4 text-red-600">
            {showLiquidityError?.message}
          </div>
        ) : (
          errors["amount"] && (
            <div className="h-4 mt-1 text-xs leading-4 text-red-600">
              {errors["amount"]?.message as string}
            </div>
          )
        )}
        <div className="relative mt-5 mb-1 text-xs text-gray-500">
          <span>To</span>
          <div
            className={clsx(
              "absolute -bottom-[4px] h-[26px] w-[70px] right-0 left-0",
              "flex justify-center items-end mx-auto text-black",
            )}
            style={{
              backgroundImage: `url(${SwapArrowBox})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <IconCmpArrow className="rotate-[-90deg] h-5 w-5" />
          </div>
        </div>
        <ChooseToToken
          token={toToken}
          setToChosenToken={setToChosenToken}
          usdRate={quote?.getTargetAmountUSD()}
          tokens={allTokens}
          isQuoteLoading={isQuoteLoading}
          value={quote?.getTargetAmountPrettified()}
          priceImpact={priceImpact}
          rebuildLayout={rebuildFromLayout || rebuildToLayout}
          setRebuildLayout={setRebuildToLayout}
          tokensAvailableToSwap={tokensAvailableToSwap}
        />
        {amount && quote && (
          <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
            {quote?.getQuoteRate()} ({quoteTimer} sec)
          </div>
        )}

        {priceImpact?.status === "high" && (
          <div className="mt-4">
            <Checkbox
              id="price-impact"
              value="allow-price-impact"
              isChecked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              labelText="I understand liquidity is too low in this DEX to maintain a reasonable impact on price, and would like to proceed anyway."
              labelClassName="!text-sm text-red-700"
              className="text-red-700 border-red-700 mt-[2px]"
              overlayClassnames="!items-start"
            />
          </div>
        )}
        {slippageQuoteError && (
          <div className="text-xs text-red-600 mt-2.5">
            {slippageQuoteError}
          </div>
        )}
        <Button
          className={clsx(
            rebuildFromLayout || rebuildToLayout
              ? "w-full mt-6"
              : "absolute bottom-5 left-5 right-5 !w-auto",
          )}
          type="primary"
          id="swapTokensButton"
          block
          icon={
            !amount ? null : isQuoteLoading ? (
              <Spinner className="w-5 h-5 text-white" />
            ) : (
              <IconCmpSwap className="text-gray-400 !w-[18px] !h-[18px] text-white" />
            )
          }
          disabled={
            isQuoteLoading ||
            !amount ||
            !quote ||
            Boolean(errors["amount"]?.message) ||
            (!isChecked && priceImpact?.status === "high")
          }
          onClick={submit}
        >
          {!amount
            ? "Enter an amount"
            : isQuoteLoading
            ? "Fetching quotes 1 of 2"
            : "Swap tokens"}
        </Button>
      </div>
    </div>
  )
}
