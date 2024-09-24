import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchActiveTokens,
  fetchAllTokens,
  fetchActiveTokenByAddress,
  fetchAllTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"

import {
  InsufficientFundsError,
  ServiceUnavailableError,
  UnsupportedTokenError,
} from "frontend/integration/icpswap/errors"
import { ShroffBuilder } from "frontend/integration/icpswap/impl/shroff-impl"
import { Shroff } from "frontend/integration/icpswap/shroff"

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

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    resetField,
    watch,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

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
        if (error instanceof Error) {
          if (error instanceof ServiceUnavailableError) {
            setShroffError(error)
          } else if (error instanceof UnsupportedTokenError) {
            setLiquidityError(error)
          } else if (error instanceof InsufficientFundsError) {
            console.error(error)
          } else {
            console.error("An unknown error occurred:", error)
          }
        } else {
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

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      onSwap({
        assetImgFrom: fromToken?.getTokenLogo() ?? "",
        assetImgTo: toToken?.getTokenLogo() ?? "",
        titleFrom: `${values.amount} ${fromToken?.getTokenSymbol()}`,
        titleTo: `${values.to} ${toToken?.getTokenSymbol()}`,
        subTitleFrom: quote?.getSourceAmountUSD()!,
        subTitleTo: quote?.getTargetAmountUSD()!,
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
    },
    [onSwap, fromToken, toToken, quote],
  )

  return (
    <SwapFTUi
      tokens={activeTokens}
      allTokens={filteredAllTokens}
      toToken={toToken}
      fromToken={fromToken}
      setValue={setValue}
      setFromChosenToken={setFromTokenAddress}
      setToChosenToken={setToTokenAddress}
      resetField={resetField}
      register={register}
      errors={errors}
      loadingMessage={"Fetching supported tokens..."}
      isTokenLoading={isFromTokenLoading || isToTokenLoading}
      handleSubmit={handleSubmit}
      submit={submit}
      value={amount}
      isQuoteLoading={isQuoteLoading || isQuoteFetching || isShroffLoading}
      quote={quote}
      showServiceError={shroffError instanceof ServiceUnavailableError}
      showLiquidityError={liquidityError}
      clearQuoteError={refresh}
    />
  )
}
