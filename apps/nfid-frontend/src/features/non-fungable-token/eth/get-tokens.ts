import { ethereumAsset } from "@nfid/integration"

export const getETHTokenActivity = async (
  contract: string,
  tokenId: string,
  size?: number,
) => {
  return await ethereumAsset.getActivitiesByItem({
    contract: contract,
    tokenId: tokenId,
    size: size,
  })
}
