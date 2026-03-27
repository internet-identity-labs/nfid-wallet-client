import { Page } from "./page"

export const addressTypes = [
  "icpAccountId",
  "icpPrincipal",
  "btc",
  "evm",
] as const
export type AddressType = (typeof addressTypes)[number]

export class AddressBook extends Page {
  get addContactButton() {
    return $(`#addAddress`)
  }

  get approveAddContactButton() {
    return $(`#approve_addContact`)
  }

  get option_removeButton() {
    return $(`#option_Remove`)
  }

  get approveRemovingButton() {
    return $(`#approveRemoving`)
  }

  get removeContactModal() {
    return $('//p[normalize-space()="Remove contact"]')
  }

  async addressRowByName(name: string) {
    return $(
      `//tr[.//td[contains(@id, "_name")]//p[normalize-space()="${name}"]]`,
    )
  }

  async addressRowByAddress(shortAddress: string, type: AddressType) {
    return $(
      `//tr[.//td[contains(@id, "_${type}") and contains(normalize-space(.), "${shortAddress}")]]`,
    )
  }

  async optionsButtonByName(name: string) {
    return (await this.addressRowByName(name)).$(`td[id*="_options"] svg`)
  }

  async contactExistsByName(name: string) {
    return (await this.addressRowByName(name)).isDisplayed()
  }

  async removeContact(name: string) {
    await (await this.optionsButtonByName(name)).click()
    await this.option_removeButton.click()
    await this.approveRemovingButton.click()
    await this.removeContactModal.waitForDisplayed({
      reverse: true,
      timeout: 25000,
    })
    await (
      await this.addressRowByName(name)
    ).waitForDisplayed({ reverse: true, timeout: 10000 })
  }

  async addContact(name: string, address: string, type: AddressType) {
    await this.AddContact.name.setValue(name)
    await this.AddContact.fields[type].setValue(address)
    await this.approveAddContactButton.click()
    await this.approveAddContactButton.waitForDisplayed({
      reverse: true,
      timeout: 25000,
    })
    await (
      await this.addressRowByName(name)
    ).waitForDisplayed({ timeout: 15000 })
  }

  AddContact = {
    name: $(`#name`),
    fields: {
      icpAccountId: $(`#accountId`),
      icpPrincipal: $(`#icpWallet`),
      btc: $(`#btcWallet`),
      evm: $(`#ethWallet`),
    },
  }
}

export default new AddressBook()
