import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchActiveTokens,
  fetchAllTokens,
  fetchActiveTokenByAddress,
  fetchAllTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"

import { ISwapSuccess } from "./swap-success"

interface ISwapFT {
  onSwapPromise: (data: ISwapSuccess) => void
}

export const SwapFT = ({ onSwapPromise }: ISwapFT) => {
  const [fromTokenAddress, setFromTokenAddress] = useState(ICP_CANISTER_ID)
  const [toTokenAddress, setToTokenAddress] = useState(CKBTC_CANISTER_ID)
  const [toAmountInUSD, setToAmountInUSD] = useState(0)
  const [slippageError, setSlippageError] = useState(true)
  const [fromAmountInUSD, setFromAmountInUSD] = useState(0)
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

  // TODO: change harcoded usd values
  const fromUsdRate = `${toAmountInUSD} USD`
  const toUsdRate = `${fromAmountInUSD} USD`

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      amount: undefined as any as string,
      to: "",
    },
  })

  const submit = useCallback(
    async (values: { amount: string; to: string }) => {
      onSwapPromise({
        assetImgFrom: fromToken?.getTokenLogo() ?? "",
        assetImgTo: toToken?.getTokenLogo() ?? "",
        titleFrom: `${values.amount} ${fromToken?.getTokenSymbol()}`,
        titleTo: `${values.to} ${toToken?.getTokenSymbol()}`,
        subTitleFrom: fromUsdRate!,
        subTitleTo: toUsdRate!,
        initialPromise: new Promise(async (resolve, reject) => {
          try {
            // TODO: change harcoded values
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
    [onSwapPromise, fromToken, toToken, fromUsdRate, toUsdRate],
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
      isLoading={isFromTokenLoading || isToTokenLoading}
      handleSubmit={handleSubmit}
      submit={submit}
      setToUsdAmount={setToAmountInUSD}
      setFromUsdAmount={setFromAmountInUSD}
      fromUsdRate={fromUsdRate}
      toUsdRate={toUsdRate}
      value={getValues("amount")}
      slippageError={slippageError}
    />
  )
}
