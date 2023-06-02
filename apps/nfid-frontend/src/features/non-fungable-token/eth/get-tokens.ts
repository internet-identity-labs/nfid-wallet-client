import { ethereumGoerliAsset } from "@nfid/integration"

export const getETHTokenActivity = async (
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
