import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"

import { ChooseModal, Copy, QRCode, BlurredLoader } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
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
    <BlurredLoader
      className="mt-4 space-y-3 text-xs"
      isLoading={!accountsOptions.length || isAccountsValidating}
    >
      <p className="text-sm">
        NFID Wallet currently supports Internet Computer Protocol tokens and
        standards: ICP, ICRC-1, EXT NFTs, and additional support coming soon.
      </p>
      {isVault && (
        <ChooseModal
          label="Accounts"
          title={"Choose an account"}
          optionGroups={accountsOptions}
          iconClassnames="!w-6 !h-auto !object-contain"
          preselectedValue={selectedAccountAddress}
          onSelect={setSelectedAccountAddress}
          type="small"
          isSmooth
        />
      )}

      {!isVault && (
        <div>
          <p className="mb-1 text-gray-400">Wallet address</p>
          <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
            <CenterEllipsis
              value={selectedAccountAddress ?? ""}
              leadingChars={29}
              trailingChars={5}
              id={"principal"}
            />
            <Copy value={selectedAccountAddress} />
          </div>
        </div>
      )}
      <div>
        <p className="mb-1 text-gray-400">
          Account ID (for deposits from exchanges)
        </p>
        <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10 text-sm">
          <CenterEllipsis
            value={address ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"address"}
          />
          <Copy value={address} />
        </div>
      </div>
      <div className="pt-[52px] mx-auto">
        <QRCode options={{ width: 150, margin: 0 }} content={address} />
      </div>

      <div
        className={clsx(
          "absolute top-0 left-0 z-50 w-full h-full p-5 bg-white transition-all duration-200 ease-in-out",
          "-translate-x-full",
        )}
      ></div>
    </BlurredLoader>
  )
}
