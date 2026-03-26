import { Then, When } from "@cucumber/cucumber"
import "../helpers/parameterTypes"
import AddressBook, {
  type AddressType,
  addressTypes,
} from "../pages/addressBook"

const isAddressType = (value: string): value is AddressType =>
  addressTypes.includes(value as AddressType)

When(
  /^User removes contact with name ([^"]+) if exists$/,
  async (name: string) => {
    if (await AddressBook.contactExistsByName(name)) {
      await AddressBook.removeContact(name)
    }
  },
)

When(
  "User adds a contact with name {string} and {word} address {string}",
  async (name: string, addressType: string, address: string) => {
    if (!isAddressType(addressType)) {
      throw new Error(`Unsupported address type: ${addressType}`)
    }

    await AddressBook.addContactButton.click()
    await AddressBook.addContact(name, address, addressType)
    await browser.refresh()
  },
)

Then(
  "The contact with name {string} and {word} address {string} is added",
  async (name: string, addressType: string, address: string) => {
    if (!isAddressType(addressType)) {
      throw new Error(`Unsupported address type: ${addressType}`)
    }

    await expect(
      await (await AddressBook.addressRowByName(name)).isDisplayed(),
    ).toBeTruthy()
    await expect(
      await (
        await AddressBook.addressRowByAddress(address, addressType)
      ).isDisplayed(),
    ).toBeTruthy()
  },
)
