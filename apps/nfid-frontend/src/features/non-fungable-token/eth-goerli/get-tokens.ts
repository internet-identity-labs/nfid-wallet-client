import { ethereumGoerliAsset } from "@nfid/integration"

export const getETHGoerliTokenActivity = async (
  contract: string,
  tokenId: string,
  size?: number,
) => {
  return await ethereumGoerliAsset.getActivitiesByItem({
    contract: contract,
    tokenId: tokenId,
    size: size,
  })
}
