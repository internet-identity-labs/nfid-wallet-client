import Page from "./page.js"

export class Nft {
  private get nftContainer() {
    return $$("#nft-container .nft")
  }

  private get nfts() {
    return $("#asset-collection-nft")
  }

  private get nftViewAll() {
    return $("#nfts-length")
  }

  private get activity() {
    return $$("table tbody tr")
  }

  public async getValueFromColumnAtFirstRow(columnName: string) {
    const locator =
      $(`//*[@id='nft-table']//thead//th[text()='${columnName}']/ancestor::table//tbody//tr[1]//td[count(//*[@id='nft-table']//thead//th[text()='${columnName}']/preceding-sibling::th) + 1]
`)
    await browser.waitUntil(async () => (await locator.getText()) != "")
    return await locator.getText()
  }

  public async getNftName(token: string, collection: string) {
    return $(`//*[contains(@id, 'nft_token_${token}_${collection}')]`)
  }

  public async getNftStandard() {
    return $(`#token-standard`)
  }

  public async getAbout() {
    return $(`#token-about`)
  }

  public async getCollectionId() {
    return $(`#collection-id`)
  }

  public async getNftCollection(collection: string) {
    return $(`#nft_collection_${collection.replace(/\s/g, "")}`)
  }

  public async getNftId(id: string) {
    return $(`#nft_id_${id.replace(/\s/g, "")}`)
  }

  public async getNftWallet(collection: string) {
    return $(`#nft_wallet_${collection.replace(/\s/g, "")}`)
  }

  public async openCollectibles() {
    await Page.loader.waitForDisplayed({ reverse: true, timeout: 55000 })
    const collectiblesTab = await $("#tab_NFTs")
    await collectiblesTab.waitForDisplayed({
      timeout: 5000,
    })
    await collectiblesTab.click()
    await Page.loader.waitForDisplayed({ reverse: true, timeout: 55000 })
  }

  public async switchToTable() {
    const table = await $("#to-table")
    await table.waitForDisplayed({
      timeout: 5000,
    })
    await table.click()
  }

  public async nftDetails(token: string, collection: string) {
    const nft = await this.getNftName(token, collection)
    await nft.waitForDisplayed({
      timeout: 30000,
    })
    await nft.click()
  }

  public async waitForNFTsAppear() {
    await this.nfts.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: "NFTs are missing",
    })
  }

  public async getNftAmount() {
    await this.nftViewAll.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: "NFTs are missing",
    })
    return this.nftViewAll
  }

  public async getNftsLength(): Promise<number> {
    return this.nftContainer.length
  }

  public async filterByBlockchain(blockchain: string) {
    const filter = await $("#filter-nft")
    await filter.waitForDisplayed({
      timeout: 5000,
    })
    await filter.click()
    const dropdown = await $("#blockchain-filter")
    await dropdown.waitForDisplayed({
      timeout: 5000,
    })
    await dropdown.click()
    const option = await $(`#option_cbx_${blockchain.replace(/\s+/g, "")}`)
    await option.waitForDisplayed({
      timeout: 5000,
    })
    await option.click()
  }

  public async getNftCollectiblesAmount(n: number) {
    await browser.waitUntil(
      async () => (await (await $("#items-amount")).getText()) === n + " items",
      {
        timeout: 15000,
        timeoutMsg:
          "Current nfts amount is " +
          (await (await $("#items-amount")).getText()),
      },
    )
  }

  public async getActivityAmount(n: number) {
    await browser.waitUntil(async () => (await this.activity.length) === n, {
      timeout: 10000,
      timeoutMsg: "Current txs amount is " + (await this.activity.length),
    })
  }
}

export default new Nft()
