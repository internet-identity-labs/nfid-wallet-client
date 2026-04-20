import { resetIntegrationCache } from "packages/integration/src/cache"
import {
  SwapFTUi,
  type SwapFTUiProps,
  type SwapSuccessDisplaySnapshot,
} from "packages/ui/src/organisms/send-receive/components/swap"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react"
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
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import {
  ftService,
  TokensAvailableToSwap,
} from "frontend/integration/ft/ft-service"
import { swapService } from "frontend/integration/swap/service/swap-service"

import { FormValues } from "../types"
import {
  getQuoteData,
  getTokensWithUpdatedBalance,
  mutateTokensCacheMergingBalances,
  updateCachedInitedTokens,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { FeeResponse } from "frontend/integration/ft/utils"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { useUserPrefs } from "frontend/hooks/user-prefs"

const QUOTE_REFETCH_TIMER = 30

type SwapFTWithSuccessSnapshotProps = SwapFTUiProps & {
  swapSuccessDisplay?: SwapSuccessDisplaySnapshot | null
}

const SwapFTUiWithSnapshot =
  SwapFTUi as unknown as FC<SwapFTWithSuccessSnapshotProps>

interface ISwapFT {
  preselectedSourceTokenAddress: string | undefined
  preselectedTargetTokenAddress: string | undefined
  onClose: () => void
  onError: (value: boolean) => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const SwapFT = ({
  preselectedSourceTokenAddress,
  preselectedTargetTokenAddress,
  onClose,
  onError,
  setErrorMessage,
  setSuccessMessage,
}: ISwapFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [swapSuccessDisplay, setSwapSuccessDisplay] =
    useState<SwapSuccessDisplaySnapshot | null>(null)
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
  const { slippage, setSlippage, hideZeroBalance } = useUserPrefs()
  const [providerError, setProviderError] = useState<
    ServiceUnavailableError | undefined
  >()
  const [fee, setFee] = useState<FeeResponse | undefined>()
  const previousFromTokenAddress = useRef(fromTokenAddress)
  const { identity } = useIdentity()

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

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const filteredTokens = useMemo(() => {
    if (!initedTokens) return
    const filtered = initedTokens.filter(
      (token: FT) => token.getChainId() === ChainId.ICP,
    )

    if (!hideZeroBalance) return filtered

    const tokensWithBalance = filtered.filter(
      (token: FT) =>
        token.getTokenAddress() === ICP_CANISTER_ID ||
        token.getTokenBalance() !== BigInt(0),
    )
    return tokensWithBalance
  }, [initedTokens, hideZeroBalance])

  const [getTransaction, setGetTransaction] = useState<
    SwapTransaction | undefined
  >()

  const resolveIcrcTokens = useCallback(
    (address: string): FT | undefined => {
      const isMatch = (token: FT) =>
        token.getTokenAddress() === address &&
        token.getChainId() === ChainId.ICP
      return (
        filteredTokens?.find(isMatch) ??
        initedTokens?.find(isMatch) ??
        tokens.find(isMatch)
      )
    },
    [filteredTokens, initedTokens, tokens],
  )

  const fromToken = useMemo(
    () => resolveIcrcTokens(fromTokenAddress),
    [fromTokenAddress, resolveIcrcTokens],
  )

  const toToken = useMemo(
    () => resolveIcrcTokens(toTokenAddress),
    [toTokenAddress, resolveIcrcTokens],
  )

  const filteredAllTokens = useMemo(() => {
    return tokens?.filter(
      (token) =>
        token.getTokenAddress() !== fromTokenAddress &&
        token.getChainId() === ChainId.ICP,
    )
  }, [fromTokenAddress, tokens])

  useEffect(() => {
    const fetchIcrc1Fee = async () => {
      setFee(undefined)
      const fee = await fromToken?.getTokenFee()
      setFee(fee)
    }

    fetchIcrc1Fee()
  }, [fromToken])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

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
    if (!filteredTokens) return
    const allFromTokens = filteredTokens.map((token) => token.getTokenAddress())

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
  }, [fromTokenAddress, toTokenAddress, filteredTokens])

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

    if (!shroff || !identity) return

    setSwapSuccessDisplay({
      titleFrom: sourceAmount,
      titleTo: targetAmount,
      subTitleFrom: sourceUsdAmount,
      subTitleTo: targetUsdAmount,
      assetImgFrom: fromToken?.getTokenLogo() ?? "",
      assetImgTo: toToken?.getTokenLogo() ?? "",
    })
    setIsSuccessOpen(true)

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
        if (!initedTokens) return
        getTokensWithUpdatedBalance(
          [fromTokenAddress, toTokenAddress],
          initedTokens,
        ).then((updatedTokens) => {
          mutateTokensCacheMergingBalances(updatedTokens)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
      })

    setGetTransaction(shroff.getSwapTransaction())
  }, [
    quote,
    shroff,
    initedTokens,
    fromTokenAddress,
    toTokenAddress,
    setErrorMessage,
    setSuccessMessage,
    identity,
    mutateInitedTokens,
    fromToken,
    toToken,
  ])

  const handleSwapClose = useCallback(() => {
    setSwapSuccessDisplay(null)
    onClose()
  }, [onClose])

  return (
    <FormProvider {...formMethods}>
      <SwapFTUiWithSnapshot
        tokens={filteredTokens || []}
        allTokens={filteredAllTokens || []}
        toToken={toToken}
        fromToken={fromToken}
        setFromChosenToken={setFromTokenAddress}
        setToChosenToken={setToTokenAddress}
        loadingMessage={"Fetching supported tokens..."}
        isTokenLoading={isTokensLoading || !fromToken || !toToken}
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
        onClose={handleSwapClose}
        swapSuccessDisplay={swapSuccessDisplay}
        quoteTimer={quoteTimer}
        slippage={slippage}
        setSlippage={setSlippage}
        swapProviders={swapProviders}
        shroff={shroff}
        setProvider={setShroff}
        tokensAvailableToSwap={tokensAvailableToSwap}
        fee={fee?.getFee()}
      />
    </FormProvider>
  )
}
