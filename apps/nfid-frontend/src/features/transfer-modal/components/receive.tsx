import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"

import { ChooseModal, Copy, QRCode, BlurredLoader } from "@nfid-frontend/ui"
import { RootWallet } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"
import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import { useAccountsOptions } from "../hooks/use-accounts-options"
import { useNetworkOptions } from "../hooks/use-network-options"
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
  const [selectedTokenStandard, setSelectedTokenStandard] = useState(
    preselectedTokenStandard,
  )
  const [selectedTokenBlockchain, setSelectedTokenBlockchain] = useState(
    preselectedTokenBlockchain,
  )
  const [selectedAccountAddress, setSelectedAccountAddress] = useState(
    preselectedAccountAddress,
  )

  console.log({ isVault })
  const { profile } = useProfile()
  const { data: networkOptions } = useNetworkOptions()
  const { data: accountsOptions } = useAccountsOptions(
    selectedTokenStandard as TokenStandards,
    selectedTokenBlockchain as Blockchain,
    isVault,
  )

  const { data: selectedConnector, isLoading: isConnectorLoading } = useSWR(
    [selectedTokenBlockchain, selectedTokenStandard, "selectedConnector"],
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
    console.log("address", selectedAccountAddress)
    return principalToAddress(Principal.fromText(selectedAccountAddress))
  }, [isPrincipalVisible, selectedAccountAddress])

  useEffect(() => {
    !isVault && setSelectedAccountAddress(accountsOptions[0]?.options[0]?.value)
  }, [accountsOptions, isVault])

  return (
    <BlurredLoader
      className="mt-4 space-y-3 text-xs"
      isLoading={!accountsOptions.length || isConnectorLoading}
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
      <ChooseModal
        label="Network"
        title={"Choose a network"}
        optionGroups={networkOptions}
        iconClassnames="!w-6 !h-auto !object-contain"
        preselectedValue={`${selectedTokenStandard}&${selectedTokenBlockchain}`}
        onSelect={(value) => {
          const arrayValue = value.split("&")
          if (arrayValue.length < 2) return

          setSelectedTokenStandard(value.split("&")[0])
          setSelectedTokenBlockchain(value.split("&")[1])
        }}
        type="small"
        isSmooth
      />
      {(isVault || profile?.wallet === RootWallet.II) && (
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
      <div>
        <p className="mb-1 text-gray-400">
          {isPrincipalVisible ? "Account ID" : "Wallet address"}
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
      {!isVault && isPrincipalVisible && (
        <div>
          <p className="mb-1 text-gray-400">Principal ID</p>
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
