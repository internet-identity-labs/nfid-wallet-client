import {polygonAsset} from "@nfid/integration"

//WIP have to be moved to connector layer
export const getPolygonTokenActivity = async (
  contract: string,
  tokenId: string,
  size?: number,
) => {
  return await polygonAsset.getActivitiesByItem({
    contract: contract,
    tokenId: tokenId,
    size: size,
  })
}
