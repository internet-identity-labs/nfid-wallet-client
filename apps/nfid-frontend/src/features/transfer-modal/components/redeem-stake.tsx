import { Redeem } from "packages/ui/src/organisms/send-receive/components/redeem"
import { useState } from "react"

import { SendStatus } from "../types"

export interface ITransferReceive {
  onClose: () => void
}

export const RedeemStake = ({ onClose }: ITransferReceive) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const redeem = () => {
    setIsSuccessOpen(true)
  }

  const initial = {
    initial: "100.75 ICP",
    initialInUsd: "723.49 USD",
  }

  const rewards = {
    rewards: "3.75 ICP",
    rewardsInUsd: "25.28 USD",
  }

  const fee = {
    fee: "0.05 ICP",
    feeInUsd: "0.34 USD",
  }

  const total = {
    total: "0.05 ICP",
    totalInUsd: "0.34 USD",
  }

  return (
    <Redeem
      onClose={onClose}
      redeem={redeem}
      initial={initial}
      rewards={rewards}
      fee={fee}
      total={total}
      isSuccessOpen={isSuccessOpen}
      status={SendStatus.COMPLETED}
      error={undefined}
    />
  )
}
