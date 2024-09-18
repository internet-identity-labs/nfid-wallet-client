import { SwapFTUi } from "packages/ui/src/organisms/send-receive/components/swap"
import {
  fetchAllTokens,
  fetchTokenByAddress,
} from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

interface ISwapFT {}

export const SwapFT = ({}: ISwapFT) => {
  const [tokenAddress, setTokenAddress] = useState(ICP_CANISTER_ID)
  const {
    data: activeTokens = [],
    isLoading: isActiveTokensLoading,
    mutate: refetchActiveTokens,
  } = useSWR("activeTokens", fetchAllTokens)

  const {
    data: token,
    isLoading: isTokenLoading,
    mutate: refetchToken,
  } = useSWR(tokenAddress ? ["token", tokenAddress] : null, ([, address]) =>
    fetchTokenByAddress(address),
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
    async (values: { amount: string; to: string }) => {},
    [],
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
