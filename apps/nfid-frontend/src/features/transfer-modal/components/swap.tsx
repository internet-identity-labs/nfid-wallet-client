import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchAllTokens,
  fetchTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { ISwapSuccess } from "./swap-success"

interface ISwapFT {
  onSwapPromise: (data: ISwapSuccess) => void
}

export const SwapFT = ({ onSwapPromise }: ISwapFT) => {
  const [tokenAddress, setTokenAddress] = useState(ICP_CANISTER_ID)
  const { data: activeTokens = [] } = useSWR("activeTokens", fetchAllTokens)

  const { data: token } = useSWR(
    tokenAddress ? ["token", tokenAddress] : null,
    ([, address]) => fetchTokenByAddress(address),
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
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
        assetImgFrom: token?.getTokenLogo() ?? "",
        assetImgTo: token?.getTokenLogo() ?? "",
        titleFrom: "123",
        titleTo: "123",
        subTitleFrom: "456",
        subTitleTo: "456",
        initialPromise: new Promise(async (resolve) => {
          try {
            resolve({ hash: "112313" })
          } catch (e) {
            throw new Error(
              `Swap error: ${(e as Error).message ? (e as Error).message : e}`,
            )
          }
        }),
      })
    },
    [onSwapPromise, token],
  )

  return (
    <SwapFTUi
      tokens={activeTokens}
      token={token}
      setValue={setValue}
      setChosenToken={setTokenAddress}
      resetField={resetField}
      register={register}
      errors={errors}
      loadingMessage={"Fetching supported tokens..."}
      isLoading={false}
      handleSubmit={handleSubmit}
      submit={submit}
    />
  )
}
