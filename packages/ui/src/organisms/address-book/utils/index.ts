import { UserAddress } from "frontend/integration/address-book"

export type AddressBookFormValues = {
  name: string
  accountId: string
  icpWallet: string
  btcWallet: string
  ethWallet: string
}

type Validator = (v?: string) => boolean | string

export const chainValidate =
  (...validators: Validator[]) =>
  (value?: string): true | string => {
    for (const validate of validators) {
      const result = validate(value)

      if (result === true) continue
      if (result === false) return "Invalid value"

      return result
    }
    return true
  }

export const validateAddressBook =
  <K extends keyof UserAddress>(
    items: UserAddress[] | undefined,
    field: K,
    errorMessage: string,
    normalize: (v: string) => string = (v) => v,
    addressId?: string,
  ) =>
  (value?: string) => {
    if (!value) return true

    const normalized = normalize(value)

    const exists = items?.some(
      (item) =>
        item.id !== addressId &&
        item[field] &&
        normalize(item[field] as string) === normalized,
    )

    return exists ? errorMessage : true
  }
