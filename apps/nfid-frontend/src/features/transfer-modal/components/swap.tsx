import { DelegationIdentity } from "@dfinity/identity"
import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchActiveTokens,
  fetchAllTokens,
  fetchActiveTokenByAddress,
  fetchAllTokenByAddress,
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
import { getIdentity, getQuoteData } from "../utils"

interface ISwapFT {
  onClose: () => void
}

export const SwapFT = ({ onClose }: ISwapFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [identity, setIdentity] = useState<DelegationIdentity>()
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff | undefined>({} as Shroff)
  const [isShroffLoading, setIsShroffLoading] = useState(true)
  const [swapStep, setSwapStep] = useState<SwapStage>(0)
  const [shroffError, setShroffError] = useState<Error | undefined>()
  const [swapError, setSwapError] = useState<
    WithdrawError | SwapError | DepositError | undefined
  >()
  const [liquidityError, setLiquidityError] = useState<Error | undefined>()
  const { data: activeTokens = [] } = useSWR("activeTokens", fetchActiveTokens)
  const { data: allTokens = [] } = useSWR(["allTokens", ""], ([, query]) =>
    fetchAllTokens(query),
  )
  const [getTransaction, setGetTransaction] = useState<
    SwapTransaction | undefined
  >()

  const { data: fromToken, isLoading: isFromTokenLoading } = useSWR(
    fromTokenAddress ? ["fromToken", fromTokenAddress] : null,
    ([, address]) => fetchActiveTokenByAddress(address),
  )

  const { data: toToken, isLoading: isToTokenLoading } = useSWR(
    toTokenAddress ? ["toToken", toTokenAddress] : null,
    ([, address]) => fetchAllTokenByAddress(address),
  )

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
        console.error(error)
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
    const interval = setInterval(() => {
      const step = getTransaction.getStage()
      const error = getTransaction.getError()
      setSwapStep(step)
      if (step === SwapStage.Completed || error !== undefined) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [getTransaction])

  const { data: quote, isLoading: isQuoteLoading } = useSWR(
    amount
      ? [fromToken?.getTokenAddress(), toToken?.getTokenAddress(), amount]
      : null,
    () => getQuoteData(amount, shroff),
    {
      onError: (error) => {
        if (error instanceof LiquidityError) setLiquidityError(error)
      },
      onSuccess: () => {
        setLiquidityError(undefined)
      },
    },
  )

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
    setIdentity(identity)

    shroff.swap(identity).catch((error) => {
      setSwapError(error)
    })

    setGetTransaction(shroff.getSwapTransaction())
  }, [quote, shroff])

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
        isTokenLoading={isFromTokenLoading || isToTokenLoading}
        submit={submit}
        isQuoteLoading={isQuoteLoading || isShroffLoading || !quote}
        quote={quote}
        showServiceError={shroffError?.name === "ServiceUnavailableError"}
        showLiquidityError={liquidityError}
        clearQuoteError={refresh}
        step={swapStep}
        error={swapError}
        isProgressOpen={isSuccessOpen}
        onClose={onClose}
        transaction={getTransaction}
        identity={identity}
      />
    </FormProvider>
  )
}
