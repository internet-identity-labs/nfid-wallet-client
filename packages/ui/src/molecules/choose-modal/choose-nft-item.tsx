import { clsx } from "clsx"

import { trimConcat } from "@nfid-frontend/utils"

import { NFT } from "frontend/integration/nft/nft"

import { IconNftPlaceholder } from "../../atoms/icons"
import ImageWithFallback from "../../atoms/image-with-fallback"
import { Skeleton } from "../../atoms/skeleton"

interface IChooseNftItem {
  token: NFT
}

export const ChooseNftItem = ({ token }: IChooseNftItem) => {
  return (
    <div
      id={trimConcat("choose_option_", token.getTokenName())}
      className={clsx(
        "hover:opacity-50 transition-opacity",
        "flex items-center justify-between",
        "py-2.5 cursor-pointer h-[60px]",
      )}
    >
      <div className="flex items-center h-[28px]">
        {!token.isInited() ? (
          <Skeleton className="w-12 h-12 mr-[18px] rounded-[12px]" />
        ) : token.getAssetPreview()?.format === "video" ? (
          <video
            muted
            autoPlay
            loop
            className="w-12 h-12 mr-[18px] rounded-[12px]"
            src={token.getAssetPreview()?.url}
          ></video>
        ) : (
          <ImageWithFallback
            alt={token.getTokenName()}
            fallbackSrc={IconNftPlaceholder}
            src={token.getAssetPreview()?.url || "#"}
            className={clsx("mr-[18px] w-12 h-12 object-cover rounded-[12px]")}
          />
        )}
        <div>
          <p className="text-sm mb-0.5 flex items-center space-x-1">
            <span className="font-semibold">{token.getTokenName()}</span>
          </p>
          <p className="text-xs text-left text-gray-400 dark:text-zinc-500">
            {token.getTokenName()}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm text-right">
          {token.getTokenFloorPriceIcpFormatted() || "Unknown"}
        </p>
        <p className="text-xs text-right text-gray-400 dark:text-zinc-500">
          {token.getTokenFloorPriceUSDFormatted() ?? null}
        </p>
      </div>
    </div>
  )
}
