import { resetIntegrationCache } from "packages/integration/src/cache"
import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import useSWR, { mutate } from "swr"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

import {
  DepositError,
  LiquidityError,
  ServiceUnavailableError,
  SlippageQuoteError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { ShroffBuilder } from "frontend/integration/icpswap/impl/shroff-impl"
import { Shroff } from "frontend/integration/icpswap/shroff"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import { FormValues } from "../types"
import {
  getIdentity,
  getQuoteData,
  getTokensWithUpdatedBalance,
} from "../utils"

const QUOTE_REFETCH_TIMER = 30

interface ISwapFT {
  onClose: () => void
}

export const SwapFT = ({ onClose }: ISwapFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff | undefined>({} as Shroff)
  const [isShroffLoading, setIsShroffLoading] = useState(true)
  const [swapStep, setSwapStep] = useState<SwapStage>(0)
  const [shroffError, setShroffError] = useState<Error | undefined>()
  const [quoteTimer, setQuoteTimer] = useState(QUOTE_REFETCH_TIMER)
  const [swapError, setSwapError] = useState<
    WithdrawError | SwapError | DepositError | undefined
  >()
  const [slippageQuoteError, setSlippageQuoteError] = useState<
    string | undefined
  >()
  const [liquidityError, setLiquidityError] = useState<Error | undefined>()
  const { data: tokens = [], isLoading: isTokensLoading } = useSWR(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )
  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])
  const [getTransaction, setGetTransaction] = useState<
    SwapTransaction | undefined
  >()

  const fromToken = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === fromTokenAddress)
  }, [fromTokenAddress, tokens])

  const toToken = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === toTokenAddress)
  }, [toTokenAddress, tokens])

  const filteredAllTokens = useMemo(() => {
    return tokens.filter(
      (token) => token.getTokenAddress() !== fromTokenAddress,
    )
  }, [fromTokenAddress, tokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  const { watch } = formMethods
  const amount = watch("amount")

  useEffect(() => {
    const getShroff = async () => {
      try {
        const shroff = await new ShroffBuilder()
          .withSource(fromTokenAddress)
          .withTarget(toTokenAddress)
          .build()
        setShroff(shroff)
        setLiquidityError(undefined)
      } catch (error) {
        setShroff(undefined)
        if (error instanceof ServiceUnavailableError) {
          setShroffError(error)
        } else if (error instanceof LiquidityError) {
          setLiquidityError(error)
        } else {
          console.error("Quote error: ", error)
          setShroffError(error as Error)
          throw error
        }
      } finally {
        setIsShroffLoading(false)
      }
    }

    if (!shroffError) getShroff()
  }, [fromTokenAddress, toTokenAddress, shroffError])

  useEffect(() => {
    if (!getTransaction) return
    const transactionInterval = setInterval(() => {
      const step = getTransaction.getStage()
      const error = getTransaction.getError()
      setSwapStep(step)
      if (step === SwapStage.Completed || error !== undefined) {
        if (transactionInterval) {
          clearInterval(transactionInterval)
        }
      }
    }, 100)

    return () => clearInterval(transactionInterval)
  }, [getTransaction])

  const {
    data: quote,
    isLoading: isQuoteLoading,
    mutate: refetchQuote,
    isValidating: isQuoteValidating,
  } = useSWR(
    toToken && fromToken && amount && shroff
      ? [toToken.getTokenAddress(), fromToken.getTokenAddress(), amount]
      : null,
    () => getQuoteData(amount, shroff),
    {
      onError: (error) => {
        if (error instanceof LiquidityError) setLiquidityError(error)
      },
      onSuccess: () => {
        setLiquidityError(undefined)
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  useEffect(() => {
    if (!quote) return
    const quoteInterval = setInterval(() => {
      setQuoteTimer((prev) => prev - 1)
      if (quoteTimer === 0) {
        resetIntegrationCache(["usdPriceForICRC1"], () => {
          refetchQuote()
          setSlippageQuoteError(undefined)
          setQuoteTimer(QUOTE_REFETCH_TIMER)
        })
      }
    }, 1000)

    if (isSuccessOpen) {
      clearInterval(quoteInterval)
    }

    return () => clearInterval(quoteInterval)
  }, [refetchQuote, quoteTimer, quote, isSuccessOpen])

  useEffect(() => {
    if (!shroff) return
    refetchQuote(() => getQuoteData(amount, shroff), true)
  }, [toToken, fromToken, refetchQuote, amount, shroff])

  const refresh = () => {
    setShroffError(undefined)
    setLiquidityError(undefined)
    setFromTokenAddress(ICP_CANISTER_ID)
    setToTokenAddress(CKBTC_CANISTER_ID)
  }

  const submit = useCallback(async () => {
    const sourceAmount = quote?.getSourceAmountPrettifiedWithSymbol()
    const targetAmount = quote?.getTargetAmountPrettifiedWithSymbol()
    const sourceUsdAmount = quote?.getSourceAmountUSD()
    const targetUsdAmount = quote?.getTargetAmountUSD()

    if (!sourceAmount || !targetAmount || !sourceUsdAmount || !targetUsdAmount)
      return

    if (!shroff) return

    try {
      await shroff.validateQuote()
    } catch (e) {
      setSlippageQuoteError((e as SlippageQuoteError).message)
      return
    }

    setIsSuccessOpen(true)

    const identity = await getIdentity(shroff.getTargets())

    shroff
      .swap(identity)
      .catch((error) => {
        setSwapError(error)
      })
      .finally(() => {
        getTokensWithUpdatedBalance(
          [fromTokenAddress, toTokenAddress],
          tokens,
        ).then((updatedTokens) => {
          mutate("tokens", updatedTokens, false)
        })
      })

    setGetTransaction(shroff.getSwapTransaction())
  }, [quote, shroff, tokens, fromTokenAddress, toTokenAddress])

  return (
    <FormProvider {...formMethods}>
      <SwapFTUi
        tokens={activeTokens}
        allTokens={filteredAllTokens}
        toToken={toToken}
        fromToken={fromToken}
        setFromChosenToken={setFromTokenAddress}
        setToChosenToken={setToTokenAddress}
        loadingMessage={"Fetching supported tokens..."}
        isTokenLoading={isTokensLoading}
        submit={submit}
        isQuoteLoading={isQuoteLoading || isShroffLoading || isQuoteValidating}
        quote={quote}
        showServiceError={shroffError?.name === "ServiceUnavailableError"}
        showLiquidityError={liquidityError}
        slippageQuoteError={slippageQuoteError}
        clearQuoteError={refresh}
        step={swapStep}
        error={swapError}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        quoteTimer={quoteTimer}
      />
    </FormProvider>
  )
}
