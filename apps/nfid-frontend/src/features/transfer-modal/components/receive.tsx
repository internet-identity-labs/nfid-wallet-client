import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"

import {
  ChooseModal,
  Copy,
  QRCode,
  BlurredLoader,
  IconSvgDfinity,
} from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import { useAccountsOptions } from "../hooks/use-accounts-options"
import { PRINCIPAL_LENGTH } from "../utils/validations"
import { ReceiveModal } from "./receive-modal"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const { data: selectedConnector, isLoading: isConnectorLoading } = useSWR(
    [preselectedTokenBlockchain, preselectedTokenStandard, "selectedConnector"],
    ([selectedTokenBlockchain, selectedTokenStandard]) =>
      getConnector({
        type: TransferModalType.FT,
        tokenStandard: selectedTokenStandard,
        blockchain: selectedTokenBlockchain,
      }),
  )

  const isPrincipalVisible = useMemo(() => {
    return !!selectedConnector?.getTokenConfig().shouldHavePrincipal
  }, [selectedConnector])

  const address = useMemo(() => {
    if (
      !isPrincipalVisible ||
      (isPrincipalVisible &&
        selectedAccountAddress?.length !== PRINCIPAL_LENGTH)
    )
      return selectedAccountAddress

    return AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(selectedAccountAddress),
    }).toHex()
  }, [isPrincipalVisible, selectedAccountAddress])

  useEffect(() => {
    !isVault && setSelectedAccountAddress(accountsOptions[0]?.options[0]?.value)
  }, [accountsOptions, isVault])

  useEffect(() => {
    sendReceiveTracking.openModal({ isSending: false })
  }, [])

  return (
    <BlurredLoader
      className="mt-4 space-y-3 text-xs"
      isLoading={
        !accountsOptions.length || isConnectorLoading || isAccountsValidating
      }
    >
      <p className="text-sm">
        Use this address for receiving tokens and NFTs. See which{" "}
        <span
          className="text-sm text-blue-600 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          tokens NFID supports.
        </span>
      </p>
      <div>
        <p className="mb-1 text-black">Network</p>
        <div className="rounded-md bg-gray-100 text-black flex items-center gap-1 px-2.5 h-10 text-sm">
          <div className="rounded-full w-6 h-6 bg-white p-1 flex justify-center items-center">
            <img src={IconSvgDfinity} alt="ICP&Internet Computer" />
          </div>
          <p>Internet Computer</p>
        </div>
      </div>
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

      {!isVault && isPrincipalVisible && (
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
          {isPrincipalVisible
            ? "Account ID (for deposits from exchanges)"
            : "Wallet address"}
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
      <div className="mx-auto">
        <QRCode
          options={{ width: isPrincipalVisible ? 140 : 200, margin: 0 }}
          content={address}
        />
      </div>

      <div
        className={clsx(
          "absolute top-0 left-0 z-50 w-full h-full p-5 bg-white transition-all duration-200 ease-in-out",
          isModalOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ReceiveModal onBack={() => setIsModalOpen(false)} />
      </div>
    </BlurredLoader>
  )
}
