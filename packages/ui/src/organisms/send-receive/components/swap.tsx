import { motion } from "framer-motion"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"
import {
  DepositError,
  ServiceUnavailableError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/errors/types"
import { Quote } from "src/integration/swap/quote"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import { BlurredLoader } from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { TokensAvailableToSwap } from "frontend/integration/ft/ft-service"
import { Shroff } from "frontend/integration/swap/shroff"

import { ErrorModal } from "./error-modal"
import { QuoteModal } from "./quote-modal"
import { SwapFTForm } from "./swap-form"
import { SwapSettings } from "./swap-settings"
import { SwapSuccessUi } from "./swap-success"

export enum SwapModal {
  SWAP = "swap",
  SETTINGS = "settings",
  QUOTE = "quote",
  SUCCESS = "success",
}

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
  providerError: ServiceUnavailableError | undefined
  showLiquidityError: Error | undefined
  slippageQuoteError: string | undefined
  isQuoteLoading: boolean
  quote: Quote | undefined
  refreshProviders: () => void
  step: SwapStage
  error?: SwapError | WithdrawError | DepositError
  isSuccessOpen: boolean
  onClose: () => void
  quoteTimer: number
  slippage: number
  setSlippage: (value: number) => void
  swapProviders: Map<SwapName, Shroff | undefined>
  shroff: Shroff | undefined
  setProvider: (value: Shroff) => void
  tokensAvailableToSwap: TokensAvailableToSwap
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
  providerError,
  showLiquidityError,
  slippageQuoteError,
  refreshProviders,
  isQuoteLoading,
  quote,
  step,
  error,
  isSuccessOpen,
  onClose,
  quoteTimer,
  slippage,
  setSlippage,
  swapProviders,
  shroff,
  setProvider,
  tokensAvailableToSwap,
}) => {
  const [isResponsive, setIsResponsive] = useState(false)
  const [selectedShroff, setSelectedShroff] = useState<Shroff | undefined>()
  const [swapModal, setSwapModal] = useState(SwapModal.SWAP)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")

  if (isTokenLoading)
    return (
      <BlurredLoader
        isLoading
        loadingMessage={loadingMessage}
        overlayClassnames="rounded-[24px] max-h-full"
        className="text-xs"
      />
    )

  return (
    <>
      {isSuccessOpen && (
        <motion.div
          key="successModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <SwapSuccessUi
            assetImgFrom={fromToken?.getTokenLogo() ?? ""}
            assetImgTo={toToken?.getTokenLogo() ?? ""}
            titleFrom={quote?.getSourceAmountPrettifiedWithSymbol()!}
            titleTo={quote?.getTargetAmountPrettifiedWithSymbol()!}
            subTitleFrom={quote?.getSourceAmountUSD()!}
            subTitleTo={quote?.getTargetAmountUSD()!}
            step={step}
            isOpen={isSuccessOpen}
            onClose={onClose}
            error={error}
            providerName={shroff?.getSwapName()}
            isResponsive={isResponsive}
          />
        </motion.div>
      )}
      {providerError && (
        <motion.div
          key="errorModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ErrorModal refresh={refreshProviders} />
        </motion.div>
      )}
      <motion.div
        key="settingsModal"
        initial={{ opacity: swapModal === SwapModal.SETTINGS ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <SwapSettings
          isOpen={swapModal === SwapModal.SETTINGS}
          setSwapModal={setSwapModal}
          setSelectedShroff={setSelectedShroff}
          slippage={slippage}
          setSlippage={setSlippage}
          swapProviders={swapProviders}
          amount={amount}
          shroff={shroff}
          setProvider={setProvider}
        />
      </motion.div>
      <motion.div
        key="quoteModal"
        initial={{ opacity: swapModal === SwapModal.QUOTE ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <QuoteModal
          isOpen={swapModal === SwapModal.QUOTE}
          setSwapModal={setSwapModal}
          shroff={selectedShroff}
          closeModal={() => setSelectedShroff(undefined)}
          amount={amount}
        />
      </motion.div>
      <motion.div
        key="formModal"
        initial={{ opacity: swapModal === SwapModal.SWAP ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <SwapFTForm
          setIsResponsive={setIsResponsive}
          isResponsive={isResponsive}
          tokens={tokens}
          allTokens={allTokens}
          fromToken={fromToken}
          toToken={toToken}
          submit={submit}
          setFromChosenToken={setFromChosenToken}
          setToChosenToken={setToChosenToken}
          showLiquidityError={showLiquidityError}
          slippageQuoteError={slippageQuoteError}
          isQuoteLoading={isQuoteLoading}
          quote={quote}
          quoteTimer={quoteTimer}
          isOpen={swapModal === SwapModal.SWAP}
          setSwapModal={setSwapModal}
          amount={amount}
          errors={errors}
          tokensAvailableToSwap={tokensAvailableToSwap}
        />
      </motion.div>
    </>
  )
}
