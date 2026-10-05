import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { Principal } from "@icp-sdk/core/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useMemo, useState } from "react"

import { useBtcAddress, useEthAddress } from "frontend/hooks"

export interface ITransferReceive {
  preselectedAccountAddress: string
  publicKey: string
  vaultCanister: string
}

export const TransferReceive = ({
  preselectedAccountAddress,
  publicKey,
  vaultCanister,
}: ITransferReceive) => {
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )
  const [accountId, setAccountId] = useState("")
  const { btcAddress, autoConversionBtcAddress } = useBtcAddress()
  const { ethAddress } = useEthAddress()

  const { vaultAddress, vaultPrincipalAddress } = useMemo(() => {
    if (!vaultCanister) return { vaultAddress: "", vaultPrincipalAddress: "" }
    return {
      vaultAddress: AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(vaultCanister),
      }).toHex(),
      vaultPrincipalAddress: vaultCanister,
    }
  }, [vaultCanister])

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
        vaultCanister={vaultCanister}
        vaultAddress={vaultAddress}
        vaultPrincipalAddress={vaultPrincipalAddress}
      />
    </div>
  )
}
