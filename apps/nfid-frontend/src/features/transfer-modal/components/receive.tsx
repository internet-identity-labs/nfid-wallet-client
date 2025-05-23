import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import toaster from "packages/ui/src/atoms/toast"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"

import { btcDepositService } from "@nfid/integration/token/btc/service"

export interface ITransferReceive {
  preselectedAccountAddress: string
  publicKey: string
}

export const TransferReceive = ({
  preselectedAccountAddress,
  publicKey,
}: ITransferReceive) => {
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )
  const [accountId, setAccountId] = useState("")
  const [btcAddress, setBtcAddress] = useState<string>("")

  useEffect(() => {
    setSelectedAccountAddress(publicKey)
    setAccountId(
      AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(publicKey),
      }).toHex(),
    )
  }, [publicKey])

  const principalFromPublicKey = Principal.from(publicKey)

  useEffect(() => {
    let cancelled = false
    const fetchBtcAddress = async () => {
      try {
        if (!principalFromPublicKey) return
        const address = await btcDepositService.generateAddress(
          principalFromPublicKey,
        )
        if (!cancelled) {
          setBtcAddress(address)
        }
      } catch (error) {
        if (!cancelled) {
          toaster.error("Failed to retrieve BTC address")
          setBtcAddress("")
        }
      }
    }
    fetchBtcAddress()
    return () => {
      cancelled = true
    }
  }, [principalFromPublicKey])

  return (
    <div>
      <Receive
        selectedAccountAddress={selectedAccountAddress}
        address={accountId}
        btcAddress={btcAddress}
      />
    </div>
  )
}
