import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import { Receive } from "packages/ui/src/organisms/send-receive/components/receive"
import { useEffect, useMemo, useState } from "react"

import { sendReceiveTracking } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "frontend/ui/connnector/types"

import { useAccountsOptions } from "../hooks/use-accounts-options"

export interface ITransferReceive {
  isVault: boolean
  preselectedTokenStandard: string
  preselectedAccountAddress: string
  preselectedTokenBlockchain?: string
}

export const TransferReceive = ({
  isVault,
  preselectedTokenStandard,
  preselectedAccountAddress,
  preselectedTokenBlockchain = Blockchain.IC,
}: ITransferReceive) => {
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )

  const { data: accountsOptions, isValidating: isAccountsValidating } =
    useAccountsOptions(
      preselectedTokenStandard as TokenStandards,
      preselectedTokenBlockchain as Blockchain,
      isVault,
      true,
    )

  const address = useMemo(() => {
    if (!selectedAccountAddress?.length) return ""
    return AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(selectedAccountAddress),
    }).toHex()
  }, [selectedAccountAddress])

  useEffect(() => {
    !isVault && setSelectedAccountAddress(accountsOptions[0]?.options[0]?.value)
  }, [accountsOptions, isVault])

  useEffect(() => {
    sendReceiveTracking.openModal({ isSending: false })
  }, [])

  return (
    <Receive
      isVault={isVault}
      isAccountsValidating={isAccountsValidating}
      accountsOptions={accountsOptions}
      selectedAccountAddress={selectedAccountAddress}
      setSelectedAccountAddress={setSelectedAccountAddress}
      address={address}
    />
  )
}
