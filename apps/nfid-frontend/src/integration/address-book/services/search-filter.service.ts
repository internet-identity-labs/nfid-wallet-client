export class SearchFilterService {
  matchesAddressLike(addressValue: string, addressLike?: string): boolean {
    if (!addressLike) return true

    const addressLower = addressValue.toLowerCase()
    const searchLower = addressLike.toLowerCase()

    return addressLower.includes(searchLower)
  }

  matchesNameOrAddressLike(
    userName: string,
    addressValue: string,
    nameOrAddressLike?: string,
  ): boolean {
    if (!nameOrAddressLike) return true

    const nameLower = userName.toLowerCase()
    const addressLower = addressValue.toLowerCase()
    const searchLower = nameOrAddressLike.toLowerCase()

    return nameLower.includes(searchLower) || addressLower.includes(searchLower)
  }
}
