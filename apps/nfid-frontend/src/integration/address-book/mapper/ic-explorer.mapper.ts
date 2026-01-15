import { IcExplorerResponse } from "@nfid/integration"
import { UserAddressPreview, AddressType, Address } from "../types"
import { v4 as uuidv4 } from "uuid"

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
      id: uuidv4(),
      name: item.alias,
      address,
    }
  }
}
