import MiniSearch from "minisearch"
import { UserAddressEntity } from "../interfaces"
import { UserAddressPreview, AddressType } from "../types"
import { FullTextMapper, SearchDocument } from "../mapper/full-text.mapper"

export class FullTextIndex {
  private index: MiniSearch<SearchDocument>

  constructor(private mapper: FullTextMapper) {
    this.index = new MiniSearch<SearchDocument>({
      fields: ["name", "address", "type"],
      storeFields: ["id", "name", "address", "type"],
    })
  }

  rebuild(entities: UserAddressEntity[]): void {
    this.index.removeAll()
    const documents = this.mapper.toSearchDocuments(entities)
    this.index.addAll(documents)
  }

  searchByNameOrAddressAndType(
    query: string,
    type: AddressType,
  ): UserAddressPreview[] {
    if (!query.trim()) return []

    const results = this.index.search(
      {
        combineWith: "OR",
        queries: [
          {
            queries: [query],
            fields: ["name"],
            prefix: true,
            fuzzy: 0.1,
          },
          {
            queries: [query],
            fields: ["address"],
            prefix: true,
            fuzzy: false,
          },
        ],
      },
      { filter: (doc) => doc.type === type },
    )

    return this.mapper.toUserAddressPreviews(results)
  }

  searchByAddressAndType(
    query: string,
    type: AddressType,
  ): UserAddressPreview[] {
    if (!query.trim()) return []

    const results = this.index.search(query, {
      fields: ["address"],
      prefix: true,
      fuzzy: false,
      filter: (doc) => doc.type === type,
    })

    return this.mapper.toUserAddressPreviews(results)
  }

  searchByType(type: AddressType): UserAddressPreview[] {
    const results = this.index.search(MiniSearch.wildcard, {
      filter: (doc) => doc.type === type,
    })

    return this.mapper.toUserAddressPreviews(results)
  }
}
