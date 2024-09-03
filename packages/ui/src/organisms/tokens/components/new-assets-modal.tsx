import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC } from "react"

import { Button, BlurredLoader } from "@nfid-frontend/ui"

type NewAssetsModalProps = {
  tokens: [] | null
}

export const NewAssetsModal: FC<NewAssetsModalProps> = ({ tokens }) => {
  return (
    <ModalComponent
      isVisible={Boolean(tokens)}
      onClose={() => undefined}
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
        <Button className="min-w-[120px]">Ok</Button>
      </div>
    </ModalComponent>
  )
}
