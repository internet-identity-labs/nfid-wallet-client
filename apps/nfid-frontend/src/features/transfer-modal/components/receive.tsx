import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"

import { getVaultsAccountsOptions } from "../utils"

export interface ITransferReceive {
  isVault: boolean
  preselectedAccountAddress: string
  publicKey: string
}

export const TransferReceive = ({
  isVault,
  preselectedAccountAddress,
  publicKey,
}: ITransferReceive) => {
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )
  const [accountId, setAccountId] = useState("")

  const [isAccountLoading, setIsAccountLoading] = useState(true)

  const {
    data: vaultsAccountsOptions = [],
    isValidating: isVaultsAccountsValidating,
  } = useSWR("vaultsAccountsOptions", getVaultsAccountsOptions)

  useEffect(() => {
    if (isVault) {
      if (!vaultsAccountsOptions) return
      setSelectedAccountAddress(vaultsAccountsOptions[0]?.options[0]?.value)
      setIsAccountLoading(isVaultsAccountsValidating)
      setAccountId(vaultsAccountsOptions[0]?.options[0]?.value)
    } else {
      setSelectedAccountAddress(publicKey)
      setAccountId(
        AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(publicKey),
        }).toHex(),
      )

      setIsAccountLoading(false)
    }
  }, [vaultsAccountsOptions, isVault, publicKey])

  useEffect(() => {
    sendReceiveTracking.openModal({ isSending: false })
  }, [])

  return (
    <Receive
      isVault={isVault}
      isAccountsLoading={isAccountLoading}
      accountsOptions={vaultsAccountsOptions}
      selectedAccountAddress={selectedAccountAddress}
      setSelectedAccountAddress={setSelectedAccountAddress}
      address={accountId}
    />
  )
}
