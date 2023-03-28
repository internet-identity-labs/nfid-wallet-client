import { IconCmpArrowRight } from "@nfid-frontend/ui"

export const TransferNFT = () => {
  return (
    <div className="text-xs">
      <p className="mb-1">NFT to transfer</p>
      <div className="border border-black rounded-md p-2 pr-5 flex items-center justify-between h-[131px]">
        <div className="flex items-center">
          <img src="" alt="" />
          <p className="text-gray-400">Choose NFT</p>
        </div>
        <div className="cursor-pointer">
          <IconCmpArrowRight />
        </div>
      </div>
      <div className="text-gray-400 mt-4 mb-4">
        <p className="mb-1">From</p>
        <div className="rounded-md bg-gray-100 px-2.5 h-14 mt-1 flex items-center cursor-pointer">
          Your NFT account address
        </div>
      </div>
      <p className="mb-1">To</p>
      <div className="border border-black rounded-md py-1.5 pl-2.5 pr-5 flex items-center justify-between cursor-pointer">
        <p>{"Recipient {blockchain} address"}</p>
        <div className="h-[46px] border-l border-gray-200 pl-5 flex items-center">
          <IconCmpArrowRight />
        </div>
      </div>
      {/* <Button>Send</Button> */}
    </div>
  )
}
