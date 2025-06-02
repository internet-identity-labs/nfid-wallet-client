import { Page } from "./page.js"

export class Nft extends Page {
  get randomTokenOnNFTtab() {
    return $("*[id^='nft_token']")
  }

  public get addressField() {
    return $("#input")
  }

  private get amountOfNFTs() {
    return $("#items-amount")
  }

  async getValueFromColumnAtFirstRow(columnName: string) {
    const locator =
      $(`//*[@id='nft-table']//thead//th[text()='${columnName}']/ancestor::table//tbody//tr[1]//td[count(//*[@id='nft-table']//thead//th[text()='${columnName}']/preceding-sibling::th) + 1]
`)
    await browser.waitUntil(async () => (await locator.getText()) != "")
    return await locator.getText()
  }

  async getNftName(token: string, collection: string) {
    return $(`//*[contains(@id, 'nft_token_${token}_${collection}')]`)
  }

  get getNftStandard() {
    return $(`#token-standard`)
  }

  get getAbout() {
    return $(`#token-about`)
  }

  get getCollectionId() {
    return $(`#collection-id`)
  }

  async getNftCollection(collection: string) {
    return $(`#nft_collection_${collection.replace(/\s/g, "")}`)
  }

  async getNftId(id: string) {
    return $(`#nft_id_${id.replace(/\s/g, "")}`)
  }

  async switchToTable() {
    const table = await $("#to-table")
    await table.waitForDisplayed({
      timeout: 5000,
    })
    await table.click()
  }

  async nftDetails(token: string, collection: string) {
    await (await this.getNftName(token, collection)).waitForDisplayed({
      timeout: 30000,
    })
    await (await this.getNftName(token, collection)).click()
  }

  async getNftCollectiblesAmount(expectedItemsAmount: number) {
    let currentItemsAmount: string
    await browser.waitUntil(
      async () => {
        currentItemsAmount = await this.amountOfNFTs.getText()
        return currentItemsAmount == `${expectedItemsAmount} items`
      },
      {
        timeout: 15000,
        timeoutMsg: `Expected ${expectedItemsAmount} items, but was ${await this.amountOfNFTs.getText()}`,
      },
    )
  }
}

export default new Nft()
