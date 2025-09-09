import { Redeem } from "packages/ui/src/organisms/send-receive/components/redeem"
import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { mutate, useSWRWithTimestamp } from "@nfid/swr"

import { fetchStakedTokens } from "frontend/features/staking/utils"
import { useIdentity } from "frontend/hooks/identity"

import { SendStatus } from "../types"

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

  const { data: stakedTokens, isLoading } = useSWRWithTimestamp(
    "stakedTokens",
    () => fetchStakedTokens(false),
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

  const redeem = () => {
    if (!identity || !stakeToRedeem) return
    setIsSuccessOpen(true)
    stakeToRedeem
      .redeem(identity)
      .then(() => {
        setSuccessMessage(`Staked ${stakeId} redeemed successful`)
        setStatus(SendStatus.COMPLETED)
        mutate("stakedTokens", fetchStakedTokens(true), { revalidate: true })
      })
      .catch((e) => {
        console.error("Redeem error: ", e)
        setError((e as Error).message)
        setStatus(SendStatus.FAILED)
        setErrorMessage("Something went wrong")
      })
  }

  return (
    <Redeem
      onClose={onClose}
      redeem={redeem}
      stakeToRedeem={stakeToRedeem}
      isSuccessOpen={isSuccessOpen}
      status={status}
      error={error}
      isLoading={isLoading || identityLoading}
    />
  )
}
