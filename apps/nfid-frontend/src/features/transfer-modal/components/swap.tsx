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

import { ShroffBuilder } from "frontend/integration/icpswap/impl/shroff-impl"
import { Shroff } from "frontend/integration/icpswap/shroff"

import { FormValues } from "../types"
import { getQuoteData } from "../utils"
import { ISwapSuccess } from "./swap-success"

interface ISwapFT {
  onSwap: (data: ISwapSuccess) => void
}

export const SwapFT = ({ onSwap }: ISwapFT) => {
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff | undefined>({} as Shroff)
  const [isShroffLoading, setIsShroffLoading] = useState(true)
  const [shroffError, setShroffError] = useState<Error | undefined>()
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
      } catch (error) {
        setShroff(undefined)
        if (error instanceof Error) {
          if (error.name === "ServiceUnavailableError") {
            setShroffError(error)
          } else if (error.name === "UnsupportedTokenError") {
            setLiquidityError(error)
          } else {
            setLiquidityError(error)
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

    onSwap({
      assetImgFrom: fromToken?.getTokenLogo() ?? "",
      assetImgTo: toToken?.getTokenLogo() ?? "",
      titleFrom: sourceAmount,
      titleTo: targetAmount,
      subTitleFrom: sourceUsdAmount,
      subTitleTo: targetUsdAmount,
      swap: new Promise(async (resolve, reject) => {
        try {
          // TODO: implement the SWAP function
          resolve({ swapProgress: "mockedProgress" })
        } catch (e) {
          console.error(
            `Swap error: ${(e as Error).message ? (e as Error).message : e}`,
          )
          reject(
            new Error(
              "Something went wrong with the ICPSwap service. Cancel your swap and try again.",
            ),
          )
        }
      }),
    })
  }, [onSwap, fromToken, toToken, quote])

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
        isQuoteLoading={isQuoteLoading || isQuoteFetching || isShroffLoading}
        quote={quote}
        showServiceError={shroffError?.name === "ServiceUnavailableError"}
        showLiquidityError={liquidityError}
        clearQuoteError={refresh}
      />
    </FormProvider>
  )
}
