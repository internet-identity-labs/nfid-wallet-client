import { Asset } from "./asset"
import {
  ActivitiesByItemRequest,
  ActivitiesByUserRequest,
  Erc20TokensByUserRequest,
  EstimatedTransaction,
  EstimatedTransactionRequest,
  ItemsByUserRequest,
  NonFungibleActivityRecords,
  NonFungibleAssetI,
  NonFungibleItems,
  Tokens,
} from "./types"

export abstract class NonFungibleAsset
  extends Asset
  implements NonFungibleAssetI
{
  abstract getActivitiesByItem(
    request: ActivitiesByItemRequest,
  ): Promise<NonFungibleActivityRecords>

  abstract getActivitiesByUser(
    request: ActivitiesByUserRequest,
  ): Promise<NonFungibleActivityRecords>

  abstract getErc20TokensByUser(
    request: Erc20TokensByUserRequest,
  ): Promise<Tokens>

  abstract getEstimatedTransaction(
    request: EstimatedTransactionRequest,
  ): Promise<EstimatedTransaction>

  abstract getItemsByUser(
    request: ItemsByUserRequest,
  ): Promise<NonFungibleItems>
}
