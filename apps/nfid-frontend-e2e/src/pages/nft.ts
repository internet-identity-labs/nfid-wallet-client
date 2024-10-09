import Assets from "./assets.js"

export class Nft {
  public get addressField() {
    return $("#input")
  }

  public get amountField() {
    return $("#amount")
  }

  private get amountOfNFTs() {
    return $("#items-amount")
  }

  public async getValueFromColumnAtFirstRow(columnName: string) {
    const locator =
      $(`//*[@id='nft-table']//thead//th[text()='${columnName}']/ancestor::table//tbody//tr[1]//td[count(//*[@id='nft-table']//thead//th[text()='${columnName}']/preceding-sibling::th) + 1]
`)
    await browser.waitUntil(async () => (
      await locator.getText() != ""),
    )
    return await locator.getText()
  }

  public getNftName(token: string, collection: string) {
    return $(`//*[contains(@id, 'nft_token_${token}_${collection}')]`)
  }

  public get getNftStandard() {
    return $(`#token-standard`)
  }

  public get getAbout() {
    return $(`#token-about`)
  }

  public get getCollectionId() {
    return $(`#collection-id`)
  }

  public getNftCollection(collection: string) {
    return $(`#nft_collection_${collection.replace(/\s/g, "")}`)
  }

  public getNftId(id: string) {
    return $(`#nft_id_${id.replace(/\s/g, "")}`)
  }

  private get NFTtab() {
    return $("#tab_NFTs")
  }

  public async openCollectibles() {
    await Assets.waitUntilElementsLoadedProperly(this.NFTtab, $("*[id^=\"nft_token\"]"))
  }

  public async switchToTable() {
    const table = await $("#to-table")
    await table.waitForDisplayed({
      timeout: 5000,
    })
    await table.click()
  }

  public async nftDetails(token: string, collection: string) {
    await this.getNftName(token, collection).waitForDisplayed({ timeout: 30000 })
    await this.getNftName(token, collection).click()
  }

  public async getNftCollectiblesAmount(n: number) {
    await browser.waitUntil(
      async () => await this.amountOfNFTs.getText() === n + " items",
      {
        timeout: 15000,
        timeoutMsg:
          "Current nfts amount is " +
          await this.amountOfNFTs.getText(),
      },
    )
  }
}

export default new Nft()
