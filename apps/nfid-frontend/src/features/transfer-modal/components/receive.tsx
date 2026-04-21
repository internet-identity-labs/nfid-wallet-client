import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"

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
  const { btcAddress, autoConversionBtcAddress } = useBtcAddress()
  const { ethAddress } = useEthAddress()

  useEffect(() => {
    setSelectedAccountAddress(publicKey)
    setAccountId(
      AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(publicKey),
      }).toHex(),
    )
  }, [publicKey])

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
