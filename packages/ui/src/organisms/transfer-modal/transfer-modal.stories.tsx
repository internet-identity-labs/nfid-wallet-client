import * as RadixTooltip from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { useAtom } from "jotai"
import React from "react"

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

const TransferModalPage: ComponentStory<typeof TransferModal> = (args) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const [selectedWalletId, setSelectedWalletId] = React.useState("")
  return (
    <RadixTooltip.Provider>
      <div className="w-full h-screen bg-red-50">
        <TransferModal
          {...args}
          tokenType={transferModalState.sendType}
          tokenConfig={{
            symbol: "ICP",
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
}
