import React, { useEffect, useState } from "react"

import { Button } from "@nfid-frontend/ui"
import toaster from "packages/ui/src/atoms/toast"
import { btcDepositService } from "@nfid/integration/token/btc/service"
import { BTCAddress } from "@nfid/integration/token/btc/types"

export const BTCDepositComponent: React.FC = () => {
  const [address, setAddress] = useState<BTCAddress | null>(null)
  const [depositStatus, setDepositStatus] = useState<
    "pending" | "confirmed" | "failed"
  >("pending")
  const [confirmations, setConfirmations] = useState(0)

  useEffect(() => {
    const generateAddress = async () => {
      try {
        const newAddress = await btcDepositService.generateAddress()
        setAddress(newAddress)
      } catch (error) {
        toaster.error("Failed to generate BTC address")
        console.error("Error generating BTC address:", error)
      }
    }
    generateAddress()
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address.address)
      toaster.success("Address copied to clipboard")
    }
  }

  const checkDepositStatus = async (txId: string) => {
    try {
      const status = await btcDepositService.getDepositStatus(txId)
      setDepositStatus(status.status)
      setConfirmations(status.confirmations)

      if (status.status === "pending") {
        setTimeout(() => checkDepositStatus(txId), 30000)
      }
    } catch (error) {
      console.error("Error checking deposit status:", error)
    }
  }

  return (
    <div>
      {address && (
        <div>
          <h3>BTC Address</h3>
          <div>
            <p>{address.address}</p>
            <Button onClick={copyAddress}>Copy address</Button>
          </div>
          <p>Created: {address.createdAt.toLocaleString()}</p>
          <div>
            <p>Status: {depositStatus}</p>
            {depositStatus === "pending" && (
              <p>Confirmations: {confirmations}/6</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
