import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import { useEffect, useState } from "react"

import { btcDepositService } from "@nfid/integration/token/btc/service"
import toaster from "@nfid/ui/atoms/toast"
import { Receive } from "@nfid/ui/organisms/send-receive/components/receive"

import { useBtcAddress, useEthAddress } from "frontend/hooks"

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
  const [autoConversionBtcAddress, setAutoConversionBtcAddress] =
    useState<string>("")
  const { btcAddress } = useBtcAddress()
  const { ethAddress } = useEthAddress()

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
          setAutoConversionBtcAddress(address)
        }
      } catch (_error) {
        if (!cancelled) {
          toaster.error("Failed to retrieve BTC address")
          setAutoConversionBtcAddress("")
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
        autoConversionBtcAddress={autoConversionBtcAddress}
        btcAddress={btcAddress}
        ethAddress={ethAddress}
      />
    </div>
  )
}
