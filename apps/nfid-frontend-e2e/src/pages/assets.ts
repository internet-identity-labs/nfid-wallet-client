export class Assets {
  private get assetLabel() {
    return "[id*='token_"
  }

  private get assetElement() {
    return "[id*='"
  }

  public async getBalance() {
    return $("#balance")
  }

  public async openAssetOptionsOnSR() {
    const assetOptions = await $("#token_ICP")
    await assetOptions.click()
  }

  public async sendFTto(address: string, amount: string) {
    const target = await $("#input")
    await target.setValue(address)
    const amountToSend = await $("#amount")
    await amountToSend.setValue(amount)
    const sendButton = await $("#sendFT")
    await sendButton.click()
  }

  public async getFee() {
    return $("#transfer_fee")
  }

  public async sendDialog() {
    const sendReceiveButton = await $("#sendReceiveButton")
    await sendReceiveButton.waitForDisplayed({
      timeout: 7000,
    })
    await sendReceiveButton.click()
  }

  public async waitWhileAssetCalculated(chain: string) {
    const btc = await $(`#token_${chain.replace(/\s/g, "")}_balance`)
    await btc.waitForExist({
      timeout: 27000,
    })
    await expect(btc).not.toHaveText("0 BTC")
  }

  public async receiveDialog() {
    await this.sendDialog()
    const tabReceive = await $("#tab_receive")
    await tabReceive.click()
  }

  public async getAddress() {
    const firstAddressPart = await $("#first_part")
    await firstAddressPart.waitForExist({
      timeout: 7000,
    })
    const secondAddressElement = await $("#second_part")
    await secondAddressElement.waitForExist({
      timeout: 7000,
    })
    return { firstAddressPart, secondAddressElement }
  }

  public async fromAccountOption() {
    const assetOptions = await $("#default_trigger_From")
    await assetOptions.click()
  }

  public async chooseOption(account: string) {
    const defaultAcc = await $(`#choose_option_${account.replace(/\s/g, "")}`)
    await defaultAcc.waitForExist({
      timeout: 17000,
    })
    await defaultAcc.click()
  }

  public async chooseAccountFrom(account: string) {
    await this.fromAccountOption()
    await this.chooseOption(account)
  }

  public async chooseAccountReceive(account: string) {
    const assetOptions = await $("#option_Account")
    await assetOptions.click()
    await this.chooseOption(account)
  }

  public async successWindow(expectedText: string) {
    const sw = await $(`#success_window`)

    await sw.waitForExist({
      timeout: 50000,
    })
    await expect(sw).toHaveTextContaining(expectedText)
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
      this.assetLabel + `${name.replace(/\s/g, "")}` + "_balance']",
    ).getText()
    expect(expectedBalance).toEqual(balance)
    let expectedUsd = await $(
      this.assetLabel + `${name.replace(/\s/g, "")}` + "_usd']",
    ).getText()
    expect(expectedUsd).toEqual(usd)
    let expectedCurrency = await $(
      this.assetLabel + `${name}` + "_currency']",
    ).getText()
    expect(expectedCurrency).toEqual(currency)
    let expectedBlockchain = await $(
      this.assetLabel + `${name.replace(/\s/g, "")}` + "_blockchain']",
    ).getText()
    expect(expectedBlockchain).toEqual(blockchain)
  }
}

export default new Assets()
