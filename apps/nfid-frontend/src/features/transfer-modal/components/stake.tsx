import toaster from "packages/ui/src/atoms/toast"
import { StakeUi } from "packages/ui/src/organisms/send-receive/components/stake"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"

import { FormValues, SendStatus } from "../types"

const DEFAULT_STAKE_ERROR = "Something went wrong"

interface IStakeFT {
  onClose: () => void
  preselectedTokenAddress?: string
}

export const StakeFT = ({ onClose, preselectedTokenAddress }: IStakeFT) => {
  const lockDuration = {
    min: 6,
    max: 96,
  }

  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status] = useState(SendStatus.PENDING)
  const [error] = useState<string | undefined>()
  const [lockValue, setLockValue] = useState(lockDuration.min)
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)

  const apr = "7.5%"
  const fee = {
    fee: "0.0001 ICP",
    feeInUsd: "0.051 USD",
  }
  const rewards = {
    rewards: "3.75 ICP",
    rewardsInUsd: "25.28 USD",
  }

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const token = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === tokenAddress)
  }, [tokenAddress, tokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
    },
  })

  useEffect(() => {
    if (!preselectedTokenAddress) {
      setTokenAddress(ICP_CANISTER_ID)
    } else {
      setTokenAddress(preselectedTokenAddress)
    }
  }, [preselectedTokenAddress])

  const submit = useCallback(async () => {
    if (!token) return toaster.error(DEFAULT_STAKE_ERROR || "No selected token")

    setIsSuccessOpen(true)
  }, [token])

  return (
    <FormProvider {...formMethods}>
      <StakeUi
        apr={apr}
        fee={fee}
        rewards={rewards}
        token={token}
        tokens={tokens}
        setChosenToken={setTokenAddress}
        isLoading={isTokensLoading}
        submit={submit}
        loadingMessage={"Fetching supported tokens..."}
        status={status}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        error={error}
        lockDuration={lockDuration}
        lockValue={lockValue}
        setLockValue={setLockValue}
      />
    </FormProvider>
  )
}
