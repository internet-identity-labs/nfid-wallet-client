import { Redeem } from "packages/ui/src/organisms/send-receive/components/redeem"
import { useCallback, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { mutate, mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import { fetchStakedTokens } from "frontend/features/staking/utils"
import { useIdentity } from "frontend/hooks/identity"

import { SendStatus } from "../types"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { getTokensWithUpdatedBalance, updateCachedInitedTokens } from "../utils"

export interface ITransferReceive {
  onClose: () => void
  stakeId: string | undefined
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const RedeemStake = ({
  onClose,
  setErrorMessage,
  setSuccessMessage,
  stakeId,
}: ITransferReceive) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const { identity, isLoading: identityLoading } = useIdentity()
  const location = useLocation()
  const tokenSymbol = location.pathname.split("/")[3]

  const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const activeTokens = useMemo(() => {
    return tokens?.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const { initedTokens, mutate: mutateInitedTokens } =
    useTokensInit(activeTokens)

  const {
    data: stakedTokens,
    isLoading,
    isValidating,
  } = useSWRWithTimestamp(
    initedTokens ? "stakedTokens" : null,
    () => fetchStakedTokens(initedTokens!, false),
    { revalidateOnFocus: false },
  )

  const stakedToken = useMemo(() => {
    return stakedTokens?.find(
      (s) => s.getToken().getTokenSymbol() === tokenSymbol,
    )
  }, [stakedTokens, tokenSymbol])

  const stakeToRedeem = useMemo(() => {
    return stakedToken
      ?.getAvailable()
      .find((stake) => stake.getStakeIdFormatted() === stakeId)
  }, [stakedToken, stakeId])

  const redeem = useCallback(() => {
    if (!identity || !stakeToRedeem || !initedTokens || !stakedToken) return
    setIsSuccessOpen(true)
    stakeToRedeem
      .redeem(identity)
      .then(() => {
        setSuccessMessage(`Staked ${stakeId} redeemed successful`)
        setStatus(SendStatus.COMPLETED)
        mutate("stakedTokens", fetchStakedTokens(initedTokens, true), {
          revalidate: true,
        })
      })
      .catch((e) => {
        console.error("Redeem error: ", e)
        setError((e as Error).message)
        setStatus(SendStatus.FAILED)
        setErrorMessage("Something went wrong")
      })
      .finally(() => {
        if (!initedTokens) return
        getTokensWithUpdatedBalance(
          [stakedToken?.getToken().getTokenAddress()],
          initedTokens,
        ).then((updatedTokens) => {
          mutateWithTimestamp("tokens", updatedTokens, false)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
      })
  }, [
    identity,
    initedTokens,
    mutateInitedTokens,
    setErrorMessage,
    setSuccessMessage,
    stakeId,
    stakeToRedeem,
    stakedToken,
  ])

  return (
    <Redeem
      onClose={onClose}
      redeem={redeem}
      stakeToRedeem={stakeToRedeem}
      isSuccessOpen={isSuccessOpen}
      status={status}
      error={error}
      isLoading={isLoading || isValidating || identityLoading}
    />
  )
}
