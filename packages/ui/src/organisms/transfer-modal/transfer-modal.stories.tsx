import * as RadixTooltip from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { useAtom } from "jotai"
import React from "react"

import { IconSvgDfinity } from "../../atoms/icons"
import { TOKEN_OPTIONS } from "../select-token/select-token-menu.mocks"
import { transferModalAtom } from "./state"
import { TransferModal } from "./transfer-modal"
import { WALLETS, WALLET_OPTIONS } from "./transfer-modal.mocks"

export default {
  title: "Organisms/TransferModal",
  component: TransferModal,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TransferModal>

const TransferModalPage: ComponentStory<typeof TransferModal> = ({
  tokenOptions,
  ...args
}) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const [selectedWalletId, setSelectedWalletId] = React.useState("")
  const [selectedTokenValue, setSelectedTokenValue] = React.useState("")

  const selectedToken = React.useMemo(
    () =>
      tokenOptions.find((option) => option.value === selectedTokenValue) ||
      tokenOptions[0],
    [tokenOptions, selectedTokenValue],
  )
  return (
    <RadixTooltip.Provider>
      <div className="w-full h-screen bg-red-50">
        <TransferModal
          {...args}
          tokenOptions={tokenOptions}
          selectedToken={selectedToken}
          onSelectToken={setSelectedTokenValue}
          tokenType={transferModalState.sendType}
          tokenConfig={{
            value: "ICP",
            icon: IconSvgDfinity,
            fee: BigInt(10000),
            toPresentation: (value = BigInt(0)) => Number(value) / 100000000,
          }}
          toggleTokenType={() =>
            setTransferModalState({
              ...transferModalState,
              sendType: transferModalState.sendType === "ft" ? "nft" : "ft",
            })
          }
          wallets={WALLETS}
          walletOptions={WALLET_OPTIONS}
          onSelectWallet={setSelectedWalletId}
          selectedWalletId={selectedWalletId}
        />
      </div>
    </RadixTooltip.Provider>
  )
}

export const TransferModalTemplate = TransferModalPage.bind({
  isSuccess: false,
})

TransferModalTemplate.args = {
  nfts: [],
  selectedNFTIds: [],
  tokenOptions: TOKEN_OPTIONS,
}
