import { IconCmpArrow } from "@nfid-frontend/ui"

import ReceiveModalImage from "../assets/receive.jpg"

export interface IReceiveModal {
  onBack: () => void
}

export const ReceiveModal = ({ onBack }: IReceiveModal) => {
  return (
    <div className="text-sm">
      <div className="flex items-center mb-4">
        <IconCmpArrow onClick={onBack} className="cursor-pointer" />
        <p className="text-xl font-bold ml-2.5">NFID token support</p>
      </div>
      <p className="">
        The NFID Wallet currently supports these standards, with additional
        support coming soon.
      </p>
      <div className="mt-3 mb-10 space-y-3 font-bold">
        <p>
          Bitcoin:<span className="font-normal"> BTC</span>
        </p>
        <p>
          Ethereum:
          <span className="font-normal"> ETH, ERC-20, ERC-721, ERC-1155</span>
        </p>
        <p>
          Polygon:
          <span className="font-normal"> MATIC, ERC-20, ERC-721, ERC-1155</span>
        </p>
        <p>
          Internet Computer:
          <span className="font-normal"> ICP, ICRC-1, EXT</span>
        </p>
      </div>
      <img
        alt="receive"
        className="absolute bottom-0 right-0"
        src={ReceiveModalImage}
      />
    </div>
  )
}
