
export class Assets {
  private get assetLabel() {
    return "[id*='token_"
  }

  private get assetElement() {
    return "[id*='"
  }

  public async openAssetByLabel(name: string) {
    await $(this.assetLabel + `${name}` + "']").waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Asset has not been showed! Missing asset label!",
    })
    await $(this.assetLabel + `${name}` + "']").click()
  }

  public async openElementById(name: string) {
    await $(this.assetElement + `${name}` + "']").waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "Element has not been showed! Missing asset label!",
    })
    await $(this.assetElement + `${name}` + "']").click()
  }

  public async isElementSelected(name: string, falseCase: string) {
    await $(this.assetElement + `${name}` + "']").waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "Element has not been showed! Missing asset label!",
    })
    let isSel = await $(this.assetElement + `${name}` + "']").isSelected()
    if (falseCase) {
      expect(isSel).toEqual(false)
    } else {
      expect(isSel).toEqual(true)
    }
  }

  public async verifyAssetFields(
    name: string,
    currency: string,
    blockchain: string,
    balance: string,
    usd: string,
  ) {
    let expectedBalance = await $(
      this.assetLabel + `${name}` + "_balance']",
    ).getText()
    expect(expectedBalance).toEqual(balance)
    let expectedUsd = await $(this.assetLabel + `${name}` + "_usd']").getText()
    expect(expectedUsd).toEqual(usd)
    let expectedCurrency = await $(
      this.assetLabel + `${name}` + "_currency']",
    ).getText()
    expect(expectedCurrency).toEqual(currency)
    let expectedBlockchain = await $(
      this.assetLabel + `${name}` + "_blockchain']",
    ).getText()
    expect(expectedBlockchain).toEqual(blockchain)
  }

}

export default new Assets()
