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

  public async getAssetBalance(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_balance']")
  }

  public async getCurrency(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_currency']")
  }

  public async getBlockchain(label: string) {
    return $(this.assetLabel + `${label.replace(/\s/g, "")}` + "_blockchain']")
  }

  private getTokenUsd(assetLabel: string) {
    return `#token_${assetLabel.replace(/\s/g, "")}_usd`
  }

  private getTokenBalance(chain: string) {
    return `#token_${chain.replace(/\s/g, "")}_balance`
  }

  private get principal() {
    return $("#principal")
  }

  private get address() {
    return $("#address")
  }

  public async openAssetOptionsOnSR() {
    const assetOptions = await $("#choose_modal")
    await assetOptions.waitForDisplayed({
      timeout: 30000,
    })
    await assetOptions.click()
  }

  public async waitWhileCalculated(asselLabel: string) {
    await $(this.getTokenUsd(asselLabel)).waitForDisplayed({
      timeout: 14000,
    })
    const usd = await $(this.getTokenUsd(asselLabel))
    await usd.waitForDisplayed({
      timeout: 14000,
    })
    await expect(usd).not.toHaveText("")
  }

  public async openAssetOptions() {
    const assetOptions = await $("#option_Asset")
    await assetOptions.click()
  }

  public async chooseChainOption(chain: string) {
    const option = await $(`#choose_option_${chain}`)
    await option.click()
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

  public async receiveDialog() {
    await this.sendDialog()
    const tabReceive = await $("#tab_receive")
    await tabReceive.click()
  }

  public async getAccountId(isAddress?: boolean) {
    let parent
    if (isAddress) {
      parent = await this.address
    } else {
      parent = await this.principal
    }
    const firstAddressPart = await parent.$("#first_part")
    await firstAddressPart.waitForExist({
      timeout: 7000,
    })
    const secondAddressElement = await parent.$("#second_part")
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
    await $(
      this.assetLabel + `${name.replace(/\s/g, "")}` + "']",
    ).waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Asset has not been showed! Missing asset label!",
    })
    await $(this.assetLabel + `${name.replace(/\s/g, "")}` + "']").click()
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
}

export default new Assets()
