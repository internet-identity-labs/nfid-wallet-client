import { resetIntegrationCache } from "packages/integration/src/cache"
import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchActiveTokens,
  fetchAllTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import useSWR from "swr"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"

import {
  DepositError,
  LiquidityError,
  ServiceUnavailableError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { ShroffBuilder } from "frontend/integration/icpswap/impl/shroff-impl"
import { Shroff } from "frontend/integration/icpswap/shroff"
import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import { FormValues } from "../types"
import { getIdentity, getQuoteData, updateTokenBalance } from "../utils"

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
  const [liquidityError, setLiquidityError] = useState<Error | undefined>()
  const { data: allTokens = [], isLoading: isAllTokensLoading } = useSWR(
    ["allTokens", ""],
    ([, query]) => fetchAllTokens(query),
    { revalidateOnFocus: false, revalidateOnMount: false },
  )
  const [getTransaction, setGetTransaction] = useState<
    SwapTransaction | undefined
  >()

  const fromToken = useMemo(() => {
    return allTokens.find(
      (token) => token.getTokenAddress() === fromTokenAddress,
    )
  }, [fromTokenAddress, allTokens])

  const toToken = useMemo(() => {
    return allTokens.find((token) => token.getTokenAddress() === toTokenAddress)
  }, [toTokenAddress, allTokens])

  const filteredAllTokens = useMemo(() => {
    return allTokens.filter(
      (token) => token.getTokenAddress() !== fromTokenAddress,
    )
  }, [fromTokenAddress, allTokens])

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
    mutate,
  } = useSWR(
    toToken && fromToken && amount
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
          mutate()
          setQuoteTimer(QUOTE_REFETCH_TIMER)
        })
      }
    }, 1000)

    if (isSuccessOpen) {
      clearInterval(quoteInterval)
    }

    return () => clearInterval(quoteInterval)
  }, [mutate, quoteTimer, quote, isSuccessOpen])

  useEffect(() => {
    if (!shroff) return
    mutate(() => getQuoteData(amount, shroff), true)
  }, [toToken, fromToken, mutate, amount, shroff])

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

    setIsSuccessOpen(true)

    if (!shroff) return

    await shroff.validateQuote()
    const identity = await getIdentity(shroff.getTargets())

    shroff
      .swap(identity)
      .catch((error) => {
        setSwapError(error)
      })
      .finally(() => {
        updateTokenBalance([fromTokenAddress, toTokenAddress], allTokens)
      })

    setGetTransaction(shroff.getSwapTransaction())
  }, [quote, shroff, allTokens, fromTokenAddress, toTokenAddress])

  return (
    <FormProvider {...formMethods}>
      <SwapFTUi
        tokens={allTokens}
        allTokens={filteredAllTokens}
        toToken={toToken}
        fromToken={fromToken}
        setFromChosenToken={setFromTokenAddress}
        setToChosenToken={setToTokenAddress}
        loadingMessage={"Fetching supported tokens..."}
        isTokenLoading={isAllTokensLoading}
        submit={submit}
        isQuoteLoading={isQuoteLoading || isShroffLoading}
        quote={quote}
        showServiceError={shroffError?.name === "ServiceUnavailableError"}
        showLiquidityError={liquidityError}
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
