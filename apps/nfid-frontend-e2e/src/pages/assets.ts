import Nft from "./nft.js"
import { Page } from "./page.js"
import Profile from "./profile.js"

export class Assets extends Page {
  get amountField() {
    return $("#choose-from-token-amount")
  }

  get sendDialogWindow() {
    return $("#sendButton")
  }

  get assetLabel() {
    return "[id*='token_"
  }

  get getSourceTokenBalance() {
    return $("#choose-from-token-balance")
  }

  get switchSendType() {
    return $("#send_type_toggle")
  }

  async getCurrency(label: string) {
    let locator = $(this.assetLabel + `${label.replace(/\s/g, "")}_currency`)
    await locator.waitForDisplayed({ timeout: 10000 })
    return locator
  }

  async getBlockchain(label: string) {
    let locator = $(this.assetLabel + `${label.replace(/\s/g, "")}_category`)
    await locator.waitForDisplayed({ timeout: 10000 })
    return locator
  }

  get principal() {
    return $("#principal")
  }

  private get address() {
    return $("#address")
  }

  get activityTab() {
    return $("#tab_Activity")
  }

  get tokensTab() {
    return $("#tab_Tokens")
  }

  get NFTtab() {
    return $("#tab_NFTs")
  }

  get stakingTab() {
    return $("#tab_Staking")
  }

  get chooseModalButton() {
    return $("#choose_modal")
  }

  get chooseNFTinSend() {
    return $("#choose-nft")
  }

  get successWindow() {
    return $("#success_window_3")
  }

  get backButtonInSendWindow() {
    return $("svg.mr-2")
  }

  get swapButton() {
    return $("#swapButton")
  }

  get tokenToSendBackButton() {
    return $(
      `//*[@id="token-to-send-title"]/parent::div/preceding-sibling::div[1]`,
    )
  }

  async tokenOptionsButton(tokenName: string) {
    return $(`#${tokenName}_options`)
  }

  async tokenUSDPrice(tokenName: string) {
    let locator = $(`#token_${tokenName.replace(/\s/g, "")}_price`)
    await locator.waitForDisplayed()
    return locator
  }

  async tokenBalance(tokenName: string) {
    let locator = $(
      `(//*[@id="token_${tokenName.replace(/\s/g, "")}_balance"]/p)[1]`,
    )
    await locator.waitForDisplayed()
    await browser.waitUntil(
      async () => {
        return (await locator.getText()) != ""
      },
      { timeout: 10000, timeoutMsg: "Token balance isn't loaded in 10 sec" },
    )
    return locator
  }

  async tokenUSDBalance(tokenName: string) {
    let locator = $(`#token_${tokenName.replace(/\s/g, "")}_usd`)
    await locator.waitForDisplayed()
    return locator
  }

  async tokenLabel(label: string) {
    return $(`#token_${label.replace(/\s/g, "")}`)
  }

  async currencyOption(currency: string) {
    return $(`#choose_option_${currency}`)
  }

  async getTokenByNameInSend(token: string) {
    return $(`#choose_option_${token}`)
  }

  async getChooseTokenModalButton(tokenRole: string) {
    return $(`#${tokenRole}Section #choose_modal`)
  }

  async getSearchTokenInputField(tokenRole: string) {
    return $(`#${tokenRole}TokenSearchInput`)
  }

  async getTokenByNameFromList(tokenRole: string, token: string) {
    return $(
      `//input[@id='${tokenRole}TokenSearchInput']/../../..//div[@id='choose_option_${token}']`,
    )
  }

  get getTargetAmountField() {
    return $("#targetSection #choose-to-token-amount")
  }

  get getSourceAmountField() {
    return $("#choose-from-token-amount")
  }

  get getTargetTokenBalance() {
    return $("#choose-to-token-balance")
  }

  get priceImpactCheckBox() {
    return $("#price-impact")
  }

  async openAssetOptionsOnSR() {
    await this.chooseModalButton.waitForClickable({ timeout: 45000 })
    await this.chooseModalButton.click()
  }

  async sendFTto(address: string, amount: string) {
    await Nft.addressField.setValue(address)
    await this.amountField.setValue(amount)

    await this.getSourceTokenBalance.waitForExist({ timeout: 10000 })
    await this.getFee.waitForExist({ timeout: 35000 })

    await this.sendDialogWindow.waitForClickable()
    await this.sendDialogWindow.click()
  }

  async sendNFTto(address: string) {
    await Nft.addressField.setValue(address)
    await this.sendDialogWindow.click()
  }

  get getFee() {
    return $("#fee")
  }

  async sendDialog() {
    await this.waitUntilElementsLoadedProperly(
      Profile.sendButton,
      this.switchSendType,
    )
  }

  async sendNFTDialog() {
    await this.waitUntilElementsLoadedProperly(
      Profile.sendButton,
      this.switchSendType,
    )
    await this.switchSendType.click()
    await super.loader.waitForExist({ reverse: true, timeout: 15000 })
  }

  async receiveDialog() {
    await this.waitUntilElementsLoadedProperly(
      Profile.receiveButton,
      $("#first_part"),
    )
  }

  async getAccountId(isAddress?: boolean) {
    let parent
    await this.address.waitForDisplayed({ timeout: 10000 })
    if (isAddress) {
      parent = await this.address
    } else {
      parent = await this.principal
    }
    const firstAddressPart = await parent.$("#first_part")
    await firstAddressPart.waitForDisplayed({
      timeout: 7000,
    })
    const secondAddressPart = await parent.$("#second_part")
    await secondAddressPart.waitForDisplayed({
      timeout: 7000,
    })
    await browser.waitUntil(
      async () => {
        return (
          (await firstAddressPart.getText()) != "" &&
          (await secondAddressPart.getText()) != ""
        )
      },
      { timeout: 15000, timeoutMsg: "Address is still empty after 15 sec" },
    )
    return { firstAddressPart, secondAddressPart }
  }

  async waitUntilElementsLoadedProperly(
    clickElement: ChainablePromiseElement,
    waitForElementOrAction:
      | ChainablePromiseElement
      | {
          element: ChainablePromiseElement
          action: (el: ChainablePromiseElement) => Promise<void>
        },
  ) {
    await browser.waitUntil(
      async () => {
        try {
          await Profile.waitUntilBalanceLoaded()
          await super.loader.waitForDisplayed({ reverse: true, timeout: 30000 })

          await clickElement.waitForClickable({ timeout: 20000 })
          await clickElement.click()
          await Page.loader.waitForDisplayed({ reverse: true, timeout: 30000 })

          if ("action" in waitForElementOrAction) {
            const { element, action } = waitForElementOrAction
            await action(element)
          } else {
            await waitForElementOrAction.waitForDisplayed()
          }

          return true
        } catch (e) {
          await browser.refresh()
        }
      },
      {
        timeout: 80000,
        timeoutMsg: `Element ${
          "element" in waitForElementOrAction
            ? await waitForElementOrAction.element.selector
            : await waitForElementOrAction.selector
        } didn't load properly in 80 seconds`,
      },
    )
  }

  async getTokenOption(option: string) {
    return $(`#option_${option.replace(" ", "\\ ")}`)
  }

  ManageTokensDialog = {
    get manageTokensDialogButton() {
      return $("#importToken")
    },
    tokenShowHideButton(tokenName: string) {
      return $(`#${tokenName}_showHideButton`)
    },
    get filterField() {
      return $("#search")
    },
  }

  SwapDialog = {
    get swapTokensButton() {
      return $("#swapTokensButton")
    },

    get successTitle() {
      return $("#swap-success-title")
    },

    get closeButton() {
      return $("#swap-success-close-button")
    },
  }
}

export default new Assets()
