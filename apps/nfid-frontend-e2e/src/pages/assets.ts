import { wait } from "@nrwl/nx-cloud/lib/utilities/waiter"

export class Assets {
  private get assetLabel() {
    return "[id*='token_"
  }

  private get assetElement() {
    return "[id*='"
  }

  public async getAssetByElementAndCompareText(
    name: string,
    expected: string,
    equality: boolean = true,
  ) {
    await $(this.assetElement + `${name}` + "']").waitUntil(
      async () =>
        await $(this.assetElement + `${name}` + "']")
          .getText()
          .then((l) => {
            return equality ? l.includes(expected) : !l.includes(expected)
          }),
      {
        timeout: 50000,
        timeoutMsg:
          "Asset equality error! " +
          (await $(this.assetElement + `${name}` + "']").getText()),
      },
    )
    return $(this.assetElement + `${name}` + "']")
  }

  public async getAssetByLabel(name: string) {
    await $(this.assetLabel + `${name}` + "']").waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Asset has not been showed! Missing asset label!",
    })
    return $(this.assetLabel + `${name}` + "']")
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

  public async waitUntilAddressWithFundsCalculated(name: string) {
    let expectedBalance = await $(
      this.assetLabel + `${name}` + "_balance']",
    ).getText()
    let calc = 50
    while (expectedBalance === "0 BTC" && calc > 0) {
      expectedBalance = await $(
        this.assetLabel + `${name}` + "_balance']",
      ).getText()
      await wait(1000)
      calc--
    }
    if (calc === 0) {
      fail("Balance did not change")
    }
  }
}

export default new Assets()
