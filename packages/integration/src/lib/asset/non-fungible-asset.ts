import { Asset } from "./asset"
import {
  ActivitiesByItemRequest,
  ActivitiesByUserRequest,
  ItemsByUserRequest,
  NonFungibleActivityRecords,
  NonFungibleAssetI,
  NonFungibleItems,
} from "./types"

export abstract class NonFungibleAsset<T>
  extends Asset<T>
  implements NonFungibleAssetI
{
  abstract getActivitiesByItem(
    request: ActivitiesByItemRequest,
  ): Promise<NonFungibleActivityRecords>

  abstract getActivitiesByUser(
    request: ActivitiesByUserRequest,
  ): Promise<NonFungibleActivityRecords>

  abstract getItemsByUser(
    request: ItemsByUserRequest,
  ): Promise<NonFungibleItems>
}
