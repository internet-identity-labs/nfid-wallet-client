import { useCallback, useMemo, useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"

import {
  ICP_CANISTER_ID,
  ICP_ROOT_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { mutate, mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"
import toaster from "@nfid/ui/atoms/toast"
import { StakeUi } from "@nfid/ui/organisms/send-receive/components/stake"
import { useTokensInit } from "@nfid/ui/organisms/send-receive/hooks/token-init"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { fetchStakedTokens } from "frontend/features/staking/utils"
import { useIdentity } from "frontend/hooks/identity"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { FormValues, SendStatus } from "../types"
import {
  getAccurateDateForStakeInSeconds,
  getTokensWithUpdatedBalance,
  updateCachedInitedTokens,
} from "../utils"

const DEFAULT_STAKE_ERROR = "Something went wrong"

interface IStakeFT {
  onClose: () => void
  preselectedTokenAddress?: string
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const StakeFT = ({
  onClose,
  preselectedTokenAddress,
  setErrorMessage,
  setSuccessMessage,
}: IStakeFT) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [lockValue, setLockValue] = useState<number | undefined>()
  const [stakingParams, setStakingParams] = useState<StakeParamsCalculator>()
  const [isStakingParamsLoading, setIsStakingParamsLoading] = useState(false)
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const { identity } = useIdentity()

  const isMaxLockTimeSelected =
    lockValue === stakingParams?.getMaximumLockTimeInMonths()
  const isMinLockTimeSelected =
    lockValue === stakingParams?.getMinimumLockTimeInMonths()

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const filteredTokens = useMemo(() => {
    if (!initedTokens) return []
    return initedTokens.filter(
      (token) =>
        token.getTokenCategory() === Category.Sns ||
        token.getTokenAddress() === ICP_CANISTER_ID,
    )
  }, [initedTokens])

  const token = useMemo(() => {
    return filteredTokens.find(
      (token) => token.getTokenAddress() === tokenAddress,
    )
  }, [tokenAddress, filteredTokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
    },
  })

  const { watch } = formMethods
  const amount = watch("amount")

  useEffect(() => {
    setLockValue(stakingParams?.getMinimumLockTimeInMonths())
    if (amount.trim()) formMethods.trigger("amount")
  }, [tokenAddress, stakingParams, amount, formMethods])

  useEffect(() => {
    const getParams = async () => {
      setStakingParams(undefined)
      setIsStakingParamsLoading(true)
      if (!token || !identity) return

      const params = await stakingService.getStakeCalculator(token, identity)
      setStakingParams(params)
      setIsStakingParamsLoading(false)
    }

    getParams()
  }, [token, identity])

  useEffect(() => {
    if (!preselectedTokenAddress) {
      setTokenAddress(NFIDW_CANISTER_ID)
    } else {
      setTokenAddress(preselectedTokenAddress)
    }
  }, [preselectedTokenAddress])

  const submit = useCallback(async () => {
    if (!identity) return
    if (!token || lockValue === undefined)
      return toaster.error(DEFAULT_STAKE_ERROR)
    setIsSuccessOpen(true)
    const rootCanisterId = token.getRootSnsCanister()
    if (!rootCanisterId) return

    if (rootCanisterId.toText() === ICP_ROOT_CANISTER_ID) {
      stakingService
        .stakeICP(
          token,
          amount,
          identity,
          stakingParams?.getFee()!,
          isMaxLockTimeSelected
            ? stakingParams?.getMaximumLockTime()
            : isMinLockTimeSelected
              ? stakingParams?.getMinimumLockTime()
              : getAccurateDateForStakeInSeconds(lockValue),
        )
        .then(() => {
          if (!initedTokens) return
          setSuccessMessage(`Stake ${amount} ICP successful`)
          setStatus(SendStatus.COMPLETED)
          mutate("stakedTokens", fetchStakedTokens(initedTokens, true), {
            revalidate: true,
          })
        })
        .catch((e) => {
          console.error("Stake error: ", e)
          setError((e as Error).message)
          setStatus(SendStatus.FAILED)
          setErrorMessage(DEFAULT_STAKE_ERROR)
        })
        .finally(() => {
          if (!initedTokens) return
          getTokensWithUpdatedBalance([ICP_CANISTER_ID], initedTokens).then(
            (updatedTokens) => {
              mutateWithTimestamp("tokens", updatedTokens, false)
              updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
            },
          )
        })

      return
    }

    stakingService
      .stake(
        token,
        amount,
        identity,
        isMaxLockTimeSelected
          ? stakingParams?.getMaximumLockTime()
          : isMinLockTimeSelected
            ? stakingParams?.getMinimumLockTime()
            : getAccurateDateForStakeInSeconds(lockValue),
      )
      .then(() => {
        if (!initedTokens) return
        setSuccessMessage(
          `Stake ${amount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        mutate("stakedTokens", () => fetchStakedTokens(initedTokens, true), {
          revalidate: true,
        })
      })
      .catch((e) => {
        console.error("Stake error: ", e)
        setError((e as Error).message)
        setStatus(SendStatus.FAILED)
        setErrorMessage(DEFAULT_STAKE_ERROR)
      })
      .finally(() => {
        if (!initedTokens) return
        getTokensWithUpdatedBalance(
          [token.getTokenAddress()],
          initedTokens,
        ).then((updatedTokens) => {
          mutateWithTimestamp("tokens", updatedTokens, false)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
      })
  }, [
    token,
    amount,
    lockValue,
    identity,
    initedTokens,
    setErrorMessage,
    setSuccessMessage,
    stakingParams,
    isMaxLockTimeSelected,
    isMinLockTimeSelected,
    mutateInitedTokens,
  ])

  return (
    <FormProvider {...formMethods}>
      <StakeUi
        token={token}
        tokens={filteredTokens}
        setChosenToken={setTokenAddress}
        isLoading={isTokensLoading}
        submit={submit}
        loadingMessage={"Fetching supported tokens..."}
        status={status}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        error={error}
        lockValue={lockValue}
        setLockValue={setLockValue}
        stakingParams={stakingParams}
        isParamsLoading={isStakingParamsLoading}
      />
    </FormProvider>
  )
}
