import { DelegationIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  IconCmpArrow,
  BlurredLoader,
  Skeleton,
  Checkbox,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import {
  DepositError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { Quote } from "frontend/integration/icpswap/quote"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import SwapArrowBox from "../assets/swap-arrow-box.png"
import { ChooseFromToken } from "./choose-from-token"
import { ChooseToToken } from "./choose-to-token"
import { ErrorModal } from "./error-modal"
import { QuoteModal } from "./quote-modal"
import { SwapSuccessUi } from "./swap-success"

export interface SwapFTUiProps {
  tokens: FT[]
  allTokens: FT[]
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => Promise<void | Id>
  setFromChosenToken: (value: string) => void
  setToChosenToken: (value: string) => void
  loadingMessage: string | undefined
  isTokenLoading: boolean
  showServiceError: boolean
  showLiquidityError: Error | undefined
  isQuoteLoading: boolean
  quote: Quote | undefined
  clearQuoteError: () => void
  step: SwapStage
  error?: SwapError | WithdrawError | DepositError
  isProgressOpen: boolean
  onClose: () => void
  transaction: SwapTransaction | undefined
  identity?: DelegationIdentity
}

export const SwapFTUi: FC<SwapFTUiProps> = ({
  tokens,
  allTokens,
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,
  loadingMessage,
  isTokenLoading,
  showServiceError,
  showLiquidityError,
  clearQuoteError,
  isQuoteLoading,
  quote,
  step,
  error,
  isProgressOpen,
  onClose,
  transaction,
  identity,
}) => {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const priceImpact = quote?.getPriceImpact()

  const amount = watch("amount")

  if (isTokenLoading)
    return (
      <BlurredLoader
        isLoading
        loadingMessage={loadingMessage}
        overlayClassnames="rounded-xl"
        className="text-xs"
      />
    )
  return (
    <>
      <SwapSuccessUi
        assetImgFrom={fromToken?.getTokenLogo() ?? ""}
        assetImgTo={toToken?.getTokenLogo() ?? ""}
        titleFrom={quote?.getSourceAmountPrettifiedWithSymbol()!}
        titleTo={quote?.getTargetAmountPrettifiedWithSymbol()!}
        subTitleFrom={quote?.getSourceAmountUSD()!}
        subTitleTo={quote?.getTargetAmountUSD()!}
        step={step}
        isOpen={isProgressOpen}
        onClose={onClose}
        error={error}
        transaction={transaction}
        identity={identity}
      />
      {showServiceError && <ErrorModal refresh={clearQuoteError} />}
      <QuoteModal
        modalOpen={quoteModalOpen}
        setModalOpen={setQuoteModalOpen}
        quote={quote}
      />
      <p className="mb-1 text-xs">From</p>
      <ChooseFromToken
        token={fromToken}
        setFromChosenToken={setFromChosenToken}
        usdRate={quote?.getSourceAmountUSD()}
        tokens={tokens}
        title="Swap from"
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
      />
      <div className="mt-[10px] flex items-center justify-between text-xs text-gray-500">
        {!amount ? (
          "Quote rate"
        ) : isQuoteLoading ? (
          <div className="flex gap-[10px]">
            <Skeleton className="w-[66px] h-1 rounded-[4px] !bg-gray-200" />
            <Skeleton className="w-[30px] h-1 rounded-[4px] !bg-gray-200" />
          </div>
        ) : (
          // TODO: implement auto refetch in 30 sec of users inactivity
          `${quote?.getQuoteRate()} (30 sec)`
        )}
        <span
          className={
            !isQuoteLoading && amount
              ? "text-teal-600 cursor-pointer"
              : "text-gray-500"
          }
          onClick={() => {
            if (isQuoteLoading || !amount) return
            setQuoteModalOpen(true)
          }}
        >
          View quote
        </span>
      </div>
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
      <Button
        className="absolute bottom-5 left-5 right-5 !w-auto"
        type="primary"
        id="sendButton"
        block
        disabled={
          isQuoteLoading ||
          !amount ||
          Boolean(errors["amount"]?.message) ||
          (!isChecked && priceImpact?.status === "high")
        }
        onClick={submit}
      >
        {!amount
          ? "Enter an amount"
          : isQuoteLoading
          ? "Fetching quote"
          : "Swap tokens"}
      </Button>
    </>
  )
}
