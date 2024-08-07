import {
  Category,
  ParsedData,
  ValueMapping,
} from "src/integration/nft/impl/ext/properties/types"
import { TokenProperties } from "src/integration/nft/impl/nft-types"

export class ExtPropertiesService {
  async getProperties(
    collectionId: string,
    tokenId: number,
  ): Promise<TokenProperties> {
    return this.fetchCollectionData(collectionId)
      .then(this.parseData)
      .then((parsedData) => {
        return this.mapToTokenProperties({
          parsedData,
          tokenId,
        })
      })
  }

  private mapToTokenProperties({
    parsedData,
    tokenId,
  }: {
    parsedData: ParsedData
    tokenId: number
  }): TokenProperties {
    //for some reason, the token number is offset by one.
    const valueMapping = parsedData.valueMappings.find(
      (mapping) => mapping.id === tokenId - 1,
    )
    if (!valueMapping) {
      return {
        mappedValues: [],
      }
    }

    const mappedValues = valueMapping.values.map(([categoryId, optionId]) => {
      const category = parsedData.categories.find(
        (cat) => cat.id === categoryId,
      )
      const option = category?.options.find((opt) => opt.id === optionId)

      return {
        category: category?.name,
        option: option?.name,
      }
    })

    return {
      mappedValues,
    }
  }

  private parseData(data: any[]): ParsedData {
    const categories: Category[] = data[0].map((cat: any) => ({
      id: cat[0],
      name: cat[1],
      options: cat[2].map((opt: any) => ({
        id: opt[0],
        name: opt[1],
      })),
    }))

    const valueMappings: ValueMapping[] = data[1].map((val: any) => ({
      id: val[0],
      values: val[1],
    }))

    return { categories, valueMappings }
  }

  private fetchCollectionData(collectionId: string): Promise<any> {
    return fetch(`https://toniq.io/filter/${collectionId}.json`).then(
      async (response) => {
        if (!response.ok) {
          return []
        }
        return response.json()
      },
    )
  }
}

export const extPropertiesService = new ExtPropertiesService()
