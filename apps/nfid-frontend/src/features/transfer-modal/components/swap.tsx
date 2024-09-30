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

import { LiquidityError } from "frontend/integration/icpswap/errors"
import { ShroffBuilder } from "frontend/integration/icpswap/impl/shroff-impl"
import { Shroff } from "frontend/integration/icpswap/shroff"

import { FormValues } from "../types"
import { getIdentity, getQuoteData } from "../utils"

interface ISwapFT {
  setIsSuccess: (value: boolean) => void
}

export const SwapFT = ({ setIsSuccess }: ISwapFT) => {
  const [isSwapProgress, setIsSwapProgress] = useState(false)
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff | undefined>({} as Shroff)
  const [isShroffLoading, setIsShroffLoading] = useState(true)
  const [swapStep, setSwapStep] = useState(0)
  const [shroffError, setShroffError] = useState<Error | undefined>()
  const [swapError, setSwapError] = useState<Error | undefined>()
  const [liquidityError, setLiquidityError] = useState<Error | undefined>()
  const { data: activeTokens = [] } = useSWR("activeTokens", fetchActiveTokens)
  const { data: allTokens = [] } = useSWR(["allTokens", ""], ([, query]) =>
    fetchAllTokens(query),
  )

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
        if (error instanceof Error) {
          console.error(error)
          if (error.name === "ServiceUnavailableError") {
            setShroffError(error)
          } else {
            setLiquidityError(new LiquidityError())
          }
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

  const {
    data: quote,
    isLoading: isQuoteLoading,
    isValidating: isQuoteFetching,
  } = useSWR(
    amount
      ? [fromToken?.getTokenAddress(), toToken?.getTokenAddress(), amount]
      : null,
    () => getQuoteData(amount, shroff),
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

    setIsSwapProgress(true)

    try {
      if (!shroff) return

      await shroff.validateQuote()
      const identity = await getIdentity(shroff.getTargets())

      shroff.swap(identity).catch((e) => {
        setSwapError(e)
      })

      let transaction = shroff.getSwapTransaction()
      transaction?.setCallback((stage) => {
        setSwapStep(stage)
      })
    } catch (e) {
      const error = (e as Error).message ? (e as Error).message : e
      console.error(`Swap error: ${error}`)
      setSwapError(error as Error)
    }
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
        isQuoteLoading={
          isQuoteLoading || isQuoteFetching || isShroffLoading || !quote
        }
        quote={quote}
        showServiceError={shroffError?.name === "ServiceUnavailableError"}
        showLiquidityError={liquidityError}
        clearQuoteError={refresh}
        step={swapStep as number}
        error={swapError?.message}
        isProgressOpen={isSwapProgress}
        closeSuccess={() => {
          setIsSwapProgress(false)
          setIsSuccess(false)
        }}
      />
    </FormProvider>
  )
}
