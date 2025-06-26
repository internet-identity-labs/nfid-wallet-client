import { resetIntegrationCache } from "packages/integration/src/cache"
import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import {
  DepositError,
  LiquidityError,
  ServiceUnavailableError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/errors/types"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import {
  BTC_NATIVE_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp, useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TokensAvailableToSwap,
} from "frontend/integration/ft/ft-service"
import { swapService } from "frontend/integration/swap/service/swap-service"
import { userPrefService } from "frontend/integration/user-preferences/user-pref-service"

import { FormValues } from "../types"
import {
  getIdentity,
  getQuoteData,
  getTokensWithUpdatedBalance,
} from "../utils"

const QUOTE_REFETCH_TIMER = 30

interface ISwapFT {
  preselectedSourceTokenAddress: string | undefined
  preselectedTargetTokenAddress: string | undefined
  onClose: () => void
  onError: (value: boolean) => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  hideZeroBalance: boolean
}

export const SwapFT = ({
  preselectedSourceTokenAddress,
  preselectedTargetTokenAddress,
  onClose,
  onError,
  hideZeroBalance,
  setErrorMessage,
  setSuccessMessage,
}: ISwapFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(NFIDW_CANISTER_ID)
  const [swapProviders, setSwapProviders] = useState<
    Map<SwapName, Shroff | undefined>
  >(new Map())
  const [tokensAvailableToSwap, setTokensAvailableToSwap] =
    useState<TokensAvailableToSwap>({ to: [], from: [] })
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
  const [slippage, setSlippage] = useState(2)
  const [providerError, setProviderError] = useState<
    ServiceUnavailableError | undefined
  >()
  const previousFromTokenAddress = useRef(fromTokenAddress)

  useEffect(() => {
    if (!preselectedSourceTokenAddress) {
      setFromTokenAddress(ICP_CANISTER_ID)
    } else {
      setFromTokenAddress(preselectedSourceTokenAddress)
      if (preselectedSourceTokenAddress !== ICP_CANISTER_ID) {
        setToTokenAddress(ICP_CANISTER_ID)
      }
    }
  }, [preselectedSourceTokenAddress])

  useEffect(() => {
    if (!preselectedTargetTokenAddress) {
      const nfidwToken = tokensAvailableToSwap.to.find(
        (item) => NFIDW_CANISTER_ID === item,
      )
      setToTokenAddress(nfidwToken || ICP_CANISTER_ID)
    } else {
      setToTokenAddress(preselectedTargetTokenAddress)
    }
  }, [preselectedTargetTokenAddress, tokensAvailableToSwap.to])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const activeTokens = useMemo(() => {
    const activeTokens = tokens.filter(
      (token: FT) =>
        token.getTokenState() === State.Active &&
        token.getTokenAddress() !== BTC_NATIVE_ID,
    )

    if (!hideZeroBalance) return activeTokens

    const tokensWithBalance = activeTokens.filter(
      (token: FT) =>
        token.getTokenAddress() === ICP_CANISTER_ID ||
        token.getTokenBalance() !== BigInt(0),
    )
    return tokensWithBalance
  }, [tokens, hideZeroBalance])

  const [getTransaction, setGetTransaction] = useState<
    SwapTransaction | undefined
  >()

  const fromToken = useMemo(() => {
    return tokens.find(
      (token: FT) => token.getTokenAddress() === fromTokenAddress,
    )
  }, [fromTokenAddress, tokens])

  const toToken = useMemo(() => {
    return tokens.find(
      (token: FT) =>
        token.getTokenAddress() === toTokenAddress &&
        token.getTokenAddress() !== BTC_NATIVE_ID,
    )
  }, [toTokenAddress, tokens])

  const filteredAllTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.getTokenAddress() !== fromTokenAddress &&
        token.getTokenAddress() !== BTC_NATIVE_ID,
    )
  }, [fromTokenAddress, tokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    userPrefService.getUserPreferences().then((userPref) => {
      setSlippage(userPref.getSlippage())
    })
  }, [])

  useEffect(() => {
    onError(Boolean(swapError))
  }, [swapError, onError])

  const { watch } = formMethods
  const amount = watch("amount")

  const isEqual = fromTokenAddress === toTokenAddress

  useEffect(() => {
    if (isEqual) {
      setToTokenAddress(previousFromTokenAddress.current)
    }
    previousFromTokenAddress.current = fromTokenAddress
  }, [fromTokenAddress, isEqual])

  const getProviders = useCallback(async () => {
    const allFromTokens = activeTokens.map((token) => token.getTokenAddress())

    try {
      const [tokensAvailableToSwapTo, providers] = await Promise.all([
        ftService.getTokensAvailableToSwap(fromTokenAddress),
        swapService.getSwapProviders(fromTokenAddress, toTokenAddress),
      ])

      setTokensAvailableToSwap({
        to: tokensAvailableToSwapTo,
        from: allFromTokens,
      })
      setSwapProviders(providers)
      setLiquidityError(undefined)
      setProviderError(undefined)
    } catch (error) {
      if (error instanceof LiquidityError) {
        setSwapProviders(new Map())
        setLiquidityError(error)
        setTokensAvailableToSwap({
          to: await ftService.getTokensAvailableToSwap(fromTokenAddress),
          from: allFromTokens,
        })
      }
      if (error instanceof ServiceUnavailableError) {
        setProviderError(error)
      }
    }
  }, [fromTokenAddress, toTokenAddress, activeTokens])

  useEffect(() => {
    getProviders()
  }, [fromTokenAddress, toTokenAddress, getProviders])

  useEffect(() => {
    const getShroff = async () => {
      try {
        const shroff = await swapService.getBestShroff(swapProviders, amount)

        setShroff(shroff)
      } catch (error) {
        setShroff(undefined)
        if (error instanceof LiquidityError) {
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
  }, [shroffError, amount, swapProviders])

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
    isValidating: isQuoteValidating,
  } = useSWR(
    toToken && fromToken && amount && shroff
      ? [toToken.getTokenAddress(), fromToken.getTokenAddress(), amount]
      : null,
    async () => {
      try {
        setLiquidityError(undefined)
        return await getQuoteData(amount, shroff)
      } catch (error) {
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

  const submit = useCallback(async () => {
    const sourceAmount = quote?.getSourceAmountPrettifiedWithSymbol()
    const targetAmount = quote?.getTargetAmountPrettifiedWithSymbol()
    const sourceUsdAmount = quote?.getSourceAmountUSD()
    const targetUsdAmount = quote?.getTargetAmountUSD()

    if (!sourceAmount || !targetAmount || !sourceUsdAmount || !targetUsdAmount)
      return

    if (!shroff) return

    setIsSuccessOpen(true)

    const identity = await getIdentity(shroff.getTargets())

    shroff
      .swap(identity)
      .then(() => {
        setSuccessMessage(`Swap ${sourceAmount} to ${targetAmount} successful`)
      })
      .catch((error) => {
        setSwapError(error)
        setErrorMessage("Something went wrong")
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
  }, [
    quote,
    shroff,
    tokens,
    fromTokenAddress,
    toTokenAddress,
    setErrorMessage,
    setSuccessMessage,
  ])

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
        providerError={providerError}
        showLiquidityError={liquidityError}
        slippageQuoteError={slippageQuoteError}
        refreshProviders={getProviders}
        step={swapStep}
        error={swapError}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        quoteTimer={quoteTimer}
        slippage={slippage}
        setSlippage={(value) => {
          setSlippage(value)
          userPrefService.getUserPreferences().then((userPref) => {
            userPref.setSlippage(value)
          })
        }}
        swapProviders={swapProviders}
        shroff={shroff}
        setProvider={setShroff}
        tokensAvailableToSwap={tokensAvailableToSwap}
      />
    </FormProvider>
  )
}
