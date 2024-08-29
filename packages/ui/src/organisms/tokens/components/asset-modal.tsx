import React, { useState } from "react"

import { Button } from "@nfid-frontend/ui"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

type IAssetModal = {
  tokens: [] | null
}

const AssetModal: React.FC<IAssetModal> = ({ tokens }) => {
  return (
    <ModalComponent
      isVisible={Boolean(tokens)}
      onClose={() => console.log("Close")}
      className="p-[30px] w-[95%] md:w-[540px] z-[100] rounded-xl"
    >
      <BlurredLoader isLoading={false} />
      <p className="text-[20px] leading-[22px] font-bold mb-[30px]">
        You have new tokens
      </p>
      <p className="mb-5 text-sm leading-5">
        NFID Wallet discovered new tokens in your portfolio.
      </p>
      <div>
        <div className="flex items-center h-16">0.12345678 GHOST</div>
      </div>
      <div className="flex items-center justify-end mt-5">
        <Button
          className="min-w-[120px]"
          onClick={() => console.log("new tokens")}
        >
          Ok
        </Button>
      </div>
    </ModalComponent>
  )
}

export default AssetModal
