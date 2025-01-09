import { resetIntegrationCache } from "packages/integration/src/cache"
import toaster from "packages/ui/src/atoms/toast"
import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp, useSWR, useSWRWithTimestamp } from "@nfid/swr"

import {
  DepositError,
  LiquidityError,
  ServiceUnavailableError,
  SlippageQuoteError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/icpswap/errors"
import { ShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"
import { SwapStage } from "src/integration/swap/icpswap/types/enums"

import { FormValues } from "../types"
import {
  getIdentity,
  getQuoteData,
  getTokensWithUpdatedBalance,
} from "../utils"

const QUOTE_REFETCH_TIMER = 30

interface ISwapFT {
  onClose: () => void
  isOpen: boolean
}

export const SwapFT = ({ onClose, isOpen }: ISwapFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff | undefined>()
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

  const isOpenRef = useRef(isOpen)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
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
      const errors = getTransaction.getErrors()
      setSwapStep(step)
      if (step === SwapStage.Completed || errors.length > 0) {
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
    error,
    isValidating: isQuoteValidating,
  } = useSWR(
    toToken && fromToken && amount && shroff
      ? [toToken.getTokenAddress(), fromToken.getTokenAddress(), amount]
      : null,
    async () => {
      try {
        setLiquidityError(undefined)
        return await getQuoteData(amount, shroff)
      } catch (e) {
        if (error instanceof LiquidityError) setLiquidityError(error)
      }
    },
    {
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
    refetchQuote(async () => {
      try {
        setLiquidityError(undefined)
        return await getQuoteData(amount, shroff)
      } catch (error) {
        if (error instanceof LiquidityError) setLiquidityError(error)
      }
    }, true)
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
      .then(() => {
        if (!isOpenRef.current)
          toaster.success(
            `Swap ${sourceAmount} to ${targetAmount} successful`,
            {
              toastId: "successSwap",
            },
          )
      })
      .catch((error) => {
        setSwapError(error)
        if (!isOpenRef.current) toaster.error("Something went wrong")
      })
      .finally(() => {
        getTokensWithUpdatedBalance(
          [fromTokenAddress, toTokenAddress],
          tokens,
        ).then((updatedTokens) => {
          mutateWithTimestamp("tokens", updatedTokens, false)
        })
      })

    setGetTransaction(shroff.getSwapTransaction())
  }, [quote, shroff, tokens, fromTokenAddress, toTokenAddress])

  if (!isOpen) return null

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
        onClose={() => {
          onClose()
          refresh()
          setIsSuccessOpen(false)
          formMethods.reset()
        }}
        quoteTimer={quoteTimer}
      />
    </FormProvider>
  )
}
