import { useCallback, useEffect, useMemo } from "react"
import { TokenConfig } from "src/ui/view-model/types"

import { ChooseModal, Copy, QRCode } from "@nfid-frontend/ui"

import { useAllToken } from "frontend/features/fungable-token/use-all-token"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

import { useTokenOptions } from "../hooks/use-token-options"
import { useWalletOptions } from "../hooks/use-wallets-options"

interface ITransferReceive {
  selectedToken?: TokenConfig
  selectedSourceWallet?: string
  assignSourceWallet: (value: string) => void
  assignSelectedToken: (value: TokenConfig) => void
}

export const TransferReceive = ({
  selectedToken,
  selectedSourceWallet,
  assignSourceWallet,
  assignSelectedToken,
}: ITransferReceive) => {
  const { tokenOptions } = useTokenOptions()
  const { walletOptions } = useWalletOptions(selectedToken?.currency ?? "ICP")
  const { wallets } = useAllWallets()
  const { token: allTokens } = useAllToken()

  const selectedWallet = useMemo(() => {
    if (!selectedSourceWallet) return

    return wallets.find((w) =>
      [
        w.principal.toText(),
        w.address,
        w.ethAddress,
        w.principalId,
        w.btcAddress,
      ].includes(selectedSourceWallet),
    )
  }, [selectedSourceWallet, wallets])

  const selectedAddress = useMemo(() => {
    switch (selectedToken?.tokenStandard) {
      case "ETH":
        return selectedWallet?.ethAddress
      case "MATIC":
        return selectedWallet?.ethAddress
      case "ERC20P":
        return selectedWallet?.ethAddress
      case "ERC20":
        return selectedWallet?.ethAddress
      case "BTC":
        return selectedWallet?.btcAddress
      case "ICP":
        return selectedWallet?.address
    }
  }, [
    selectedToken?.tokenStandard,
    selectedWallet?.address,
    selectedWallet?.ethAddress,
    selectedWallet?.btcAddress,
  ])

  const handleSelectToken = useCallback(
    (value: string) => {
      const token = allTokens.find((t) => t.currency === value)
      if (!token) return

      assignSelectedToken(token)
    },
    [allTokens, assignSelectedToken],
  )

  useEffect(() => {
    assignSourceWallet(walletOptions[0].options[0]?.value)
  }, [walletOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3 text-xs">
      <ChooseModal
        label="Asset"
        title={"Choose an asset"}
        optionGroups={tokenOptions}
        iconClassnames="!w-6 !h-auto !object-contain"
        preselectedValue={selectedToken?.currency}
        onSelect={handleSelectToken}
        type="small"
      />
      <ChooseModal
        label="Account"
        optionGroups={walletOptions}
        title={"Choose an account"}
        onSelect={(value) => assignSourceWallet(value)}
        preselectedValue={selectedSourceWallet}
        type="small"
      />
      {["ETH", "ICP", "BTC", "ERC20", "MATIC", "ERC20P"].includes(
        selectedToken?.tokenStandard ?? "",
      ) && (
        <div>
          <p className="mb-1 text-gray-400">
            {selectedToken?.tokenStandard === "ETH" ||
            selectedToken?.tokenStandard === "BTC" ||
            selectedToken?.tokenStandard === "ERC20" ||
            selectedToken?.tokenStandard === "MATIC" ||
            selectedToken?.tokenStandard === "ERC20P"
              ? "Wallet address"
              : "Account ID"}
          </p>
          <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10">
            <CenterEllipsis
              value={selectedAddress ?? ""}
              leadingChars={29}
              trailingChars={5}
              id={"principal"}
            />
            <Copy value={selectedAddress ?? ""} />
          </div>
        </div>
      )}

      {["ICP", "DIP20"].includes(selectedToken?.tokenStandard ?? "") && (
        <div>
          <p className="mb-1 text-gray-400">Principal ID</p>
          <div className="rounded-md bg-gray-100 text-gray-400 flex items-center justify-between px-2.5 h-10">
            <CenterEllipsis
              value={selectedWallet?.principal.toText() ?? ""}
              leadingChars={29}
              trailingChars={5}
              id={"address"}
            />
            <Copy value={selectedWallet?.principal.toText() ?? ""} />
          </div>
        </div>
      )}
      <div className="w-[150px] my-4 mx-auto">
        <QRCode
          options={{ width: 150, margin: 0 }}
          content={selectedAddress ?? selectedWallet?.principal.toText() ?? ""}
        />
      </div>
    </div>
  )
}
