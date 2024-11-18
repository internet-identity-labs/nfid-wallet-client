import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"

import { sendReceiveTracking } from "@nfid/integration"

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

  const [isAccountLoading, setIsAccountLoading] = useState(true)

  useEffect(() => {
    setSelectedAccountAddress(publicKey)
    setAccountId(
      AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(publicKey),
      }).toHex(),
    )

    setIsAccountLoading(false)
    //}
  }, [publicKey])

  useEffect(() => {
    sendReceiveTracking.openModal({ isSending: false })
  }, [])

  return (
    <Receive
      isLoading={isAccountLoading}
      selectedAccountAddress={selectedAccountAddress}
      setSelectedAccountAddress={setSelectedAccountAddress}
      address={accountId}
    />
  )
}
