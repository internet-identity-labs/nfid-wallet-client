import { SignIdentity } from "@dfinity/agent"
import toaster from "packages/ui/src/atoms/toast"
import { StakeUi } from "packages/ui/src/organisms/send-receive/components/stake"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"

import { NFIDW_CANISTER_ID } from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { StakeParamsCalculator } from "frontend/integration/staking/stake-params-calculator"

import { FormValues, SendStatus } from "../types"
import { getIdentity, getTokensWithUpdatedBalance } from "../utils"

const DEFAULT_STAKE_ERROR = "Something went wrong"
const MONTHS_TO_SECONDS = 30 * 24 * 60 * 60

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
  const [status] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [lockValue, setLockValue] = useState<number | undefined>()
  const [stakingParams, setStakingParams] = useState<StakeParamsCalculator>()
  const [isStakingParamsLoading, setIsStakingParamsLoading] = useState(false)
  const [tokenAddress, setTokenAddress] = useState(preselectedTokenAddress)
  const [identity, setIdentity] = useState<SignIdentity>()

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const tokensForStake = useMemo(() => {
    return tokens.filter((token) => token.getTokenCategory() === Category.Sns)
  }, [tokens])

  const token = useMemo(() => {
    return tokensForStake.find(
      (token) => token.getTokenAddress() === tokenAddress,
    )
  }, [tokenAddress, tokensForStake])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
    },
  })

  const { watch } = formMethods

  useEffect(() => {
    setLockValue(stakingParams?.getMinimumLockTimeInMonths())
  }, [tokenAddress, stakingParams])

  const amount = watch("amount")

  useEffect(() => {
    const getParams = async () => {
      if (!token) return
      const rootCanisterId = token.getRootSnsCanister()
      if (!rootCanisterId) return
      const canister_ids = await stakingService.getTargets(rootCanisterId)
      if (!canister_ids) return

      setIsStakingParamsLoading(true)
      const identity = await getIdentity([
        canister_ids,
        token.getTokenAddress(),
      ])
      setIdentity(identity)

      const params = await stakingService.getStakeCalculator(token, identity)
      setStakingParams(params)
      setIsStakingParamsLoading(false)
    }

    getParams()
  }, [token])

  useEffect(() => {
    if (!preselectedTokenAddress) {
      setTokenAddress(NFIDW_CANISTER_ID)
    } else {
      setTokenAddress(preselectedTokenAddress)
    }
  }, [preselectedTokenAddress])

  const submit = useCallback(async () => {
    if (!identity) return
    if (!token) return toaster.error(DEFAULT_STAKE_ERROR || "No selected token")
    setIsSuccessOpen(true)

    stakingService
      .stake(
        token,
        amount,
        identity,
        lockValue === stakingParams?.getMaximumLockTimeInMonths()
          ? stakingParams?.getMaximumLockTime()
          : lockValue! * MONTHS_TO_SECONDS,
      )
      .then(() => {
        setSuccessMessage(
          `Stake ${amount} ${token.getTokenSymbol()} successful`,
        )
      })
      .catch((e) => {
        console.error("Stake error: ", e)
        setError((e as Error).message)
        setErrorMessage("Something went wrong")
      })
      .finally(() => {
        getTokensWithUpdatedBalance([token.getTokenAddress()], tokens).then(
          (updatedTokens) => {
            mutateWithTimestamp("tokens", updatedTokens, false)
          },
        )
      })
  }, [
    token,
    amount,
    lockValue,
    identity,
    tokens,
    setErrorMessage,
    setSuccessMessage,
    stakingParams,
  ])

  return (
    <FormProvider {...formMethods}>
      <StakeUi
        token={token}
        tokens={tokensForStake}
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
