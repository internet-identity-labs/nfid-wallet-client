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

import { Shroff } from "frontend/integration/icpswap/shroff"

import { getQuoteData, getShroff } from "../utils"
import { ISwapSuccess } from "./swap-success"

interface ISwapFT {
  onSwapPromise: (data: ISwapSuccess) => void
}

export const SwapFT = ({ onSwapPromise }: ISwapFT) => {
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [shroff, setShroff] = useState<Shroff>({} as Shroff)
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
      amount: undefined as any as string,
      to: "",
    },
  })

  const amount = watch("amount")

  useEffect(() => {
    getShroff(fromTokenAddress, toTokenAddress).then(setShroff)
  }, [fromTokenAddress, toTokenAddress])

  const {
    data: quote,
    isLoading: isQuoteLoading,
    isValidating: isQuoteFetching,
    error: quoteError,
  } = useSWR(
    amount
      ? [fromToken?.getTokenAddress(), toToken?.getTokenAddress(), amount]
      : null,
    () => getQuoteData(amount, shroff),
  )

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      onSwapPromise({
        assetImgFrom: fromToken?.getTokenLogo() ?? "",
        assetImgTo: toToken?.getTokenLogo() ?? "",
        titleFrom: `${values.amount} ${fromToken?.getTokenSymbol()}`,
        titleTo: `${values.to} ${toToken?.getTokenSymbol()}`,
        subTitleFrom: quote?.getSourceAmountUSD()!,
        subTitleTo: quote?.getTargetAmountUSD()!,
        initialPromise: new Promise(async (resolve, reject) => {
          try {
            // TODO: implement the SWAP function
            resolve({ hash: "?????" })
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
    [onSwapPromise, fromToken, toToken, quote],
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
      quoteError={quoteError}
      isQuoteLoading={isQuoteLoading || isQuoteFetching}
      quote={quote}
    />
  )
}
