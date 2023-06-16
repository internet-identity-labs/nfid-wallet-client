import { polygonMumbaiAsset } from "@nfid/integration"

//WIP have to be moved to connector layer
export const getPolygonMumbaiTokenActivity = async (
  contract: string,
  tokenId: string,
  size?: number,
) => {
  return await polygonMumbaiAsset.getActivitiesByItem({
    contract: contract,
    tokenId: tokenId,
    size: size,
  })
}
