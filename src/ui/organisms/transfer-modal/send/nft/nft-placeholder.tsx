import clsx from "clsx"

export const TransferSendNFTPlaceholder = () => {
  return (
    <div className="flex items-center space-x-4 h-[142px]">
      <span className="bg-gray-50 h-[134px] w-[134px] rounded-md" />
      <div className={clsx("text-xs text-gray-400 space-y-2.5")}>
        <p
          className={clsx(
            "w-[205px] bg-gray-50 font-medium",
            "px-2 py-1 rounded-md",
          )}
        >
          Collection
        </p>
        <p
          className={clsx(
            "w-[226px] text-sm font-semibold bg-gray-50",
            "px-2 py-1 rounded-md",
          )}
        >
          NFT item name
        </p>
        <p
          className={clsx(
            "w-[147px] bg-gray-50 font-medium",
            "px-2 py-1 rounded-md",
          )}
        >
          Wallet
        </p>
      </div>
    </div>
  )
}
