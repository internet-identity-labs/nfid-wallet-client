import { IcExplorerResponse } from "../interfaces"
import { UserAddressPreview, AddressType, Address } from "../types"

export class IcExplorerMapper {
  toUserAddressPreview(
    response: IcExplorerResponse,
    keyword: string,
  ): UserAddressPreview | undefined {
    const item = response.data?.addressList?.[0]

    if (!item?.alias) {
      return undefined
    }

    const type =
      item.accountId == keyword
        ? AddressType.ICP_ADDRESS
        : AddressType.ICP_PRINCIPAL

    const address: Address = {
      type,
      value: keyword,
    }

    return {
      id: keyword,
      name: item.alias,
      address,
    }
  }
}
