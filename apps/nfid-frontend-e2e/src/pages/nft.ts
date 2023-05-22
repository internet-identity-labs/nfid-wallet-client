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

  public async getNftName(token: string) {
    return $(`#nft_token_${token.replace(/\s|#/g, "")}`)
  }

  public async getNftCollection(collection: string) {
    return $(`#nft_collection_${collection.replace(/\s/g, "")}`)
  }

  public async getNftId(collection: string) {
    return $(`#nft_id_${collection.replace(/\s/g, "")}`)
  }

  public async getNftWallet(collection: string) {
    return $(`#nft_wallet_${collection.replace(/\s/g, "")}`)
  }

  public async openCollectibles() {
    const collectiblesTab = await $("#desktop #profile-collectibles")
    await collectiblesTab.waitForDisplayed({
      timeout: 5000,
    })
    await collectiblesTab.click()
  }

  public async switchToTable() {
    const table = await $("#to-table")
    await table.waitForDisplayed({
      timeout: 5000,
    })
    await table.click()
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
    const option = await $(`#option_cbx_${blockchain}`)
    await option.waitForDisplayed({
      timeout: 5000,
    })
    await option.click()
  }

  public async getNftCollectiblesAmount(n: number) {
    await $("#items-amount").then(async (x) =>
      x
        .waitForDisplayed({ timeout: 27000 })
        .then(async () => expect(x).toHaveText(n + " items")),
    )
  }
}

export default new Nft()
