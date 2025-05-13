import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"
import { btcDepositService } from "@nfid/integration/token/btc/service"
import toaster from "packages/ui/src/atoms/toast"

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

  useEffect(() => {
    const fetchBtcAddress = async () => {
      try {
        const btc = await btcDepositService.generateAddress(publicKey)
        setBtcAddress(btc.address)
      } catch (error) {
        console.debug("[TransferReceive] Error generating BTC address", error)
        toaster.error("Failed to generate BTC address")
        setBtcAddress("")
      }
    }
    fetchBtcAddress()
  }, [publicKey])

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
