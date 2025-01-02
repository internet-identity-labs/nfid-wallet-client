import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"

export interface ITransferReceive {
  preselectedAccountAddress: string
  publicKey: string
  isOpen: boolean
}

export const TransferReceive = ({
  preselectedAccountAddress,
  publicKey,
  isOpen,
}: ITransferReceive) => {
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )
  const [accountId, setAccountId] = useState("")

  useEffect(() => {
    setSelectedAccountAddress(publicKey)
    setAccountId(
      AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(publicKey),
      }).toHex(),
    )
  }, [publicKey])

  if (!isOpen) return null

  return (
    <Receive
      selectedAccountAddress={selectedAccountAddress}
      address={accountId}
    />
  )
}
