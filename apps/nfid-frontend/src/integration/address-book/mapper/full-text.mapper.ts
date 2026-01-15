import { SearchResult } from "minisearch"
import { UserAddressEntity } from "../interfaces"
import { UserAddressPreview, AddressType } from "../types"

export interface SearchDocument {
  id: string
  entityId: string
  name: string
  address: string
  type: AddressType
}

export class FullTextMapper {
  toSearchDocuments(entities: UserAddressEntity[]): SearchDocument[] {
    return entities.flatMap((entity) =>
      entity.addresses.map((address) => ({
        id: `${entity.id}:${address.value}`,
        entityId: entity.id,
        name: entity.name,
        address: address.value,
        type: address.type,
      })),
    )
  }

  toUserAddressPreview(doc: SearchResult): UserAddressPreview {
    return {
      id: doc.entityId,
      name: doc.name,
      address: {
        type: doc.type,
        value: doc.address,
      },
    }
  }

  toUserAddressPreviews(docs: SearchResult[]): UserAddressPreview[] {
    return docs.map((doc) => this.toUserAddressPreview(doc))
  }
}
