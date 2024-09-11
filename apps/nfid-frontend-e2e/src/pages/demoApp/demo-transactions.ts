import cucumberJson from "wdio-cucumberjs-json-reporter"

import { demoAppPage } from "./demoApp-page.js"

export class DemoTransactions extends demoAppPage {
  get myNFTSelector() {
    return $("#option_3hfnf-vakor-uwiaa-aaaaa-b4atg-aaqca-aacgm-a")
  }

  get getApproveButton() {
    return $(`#approveButton div`)
  }

  getEmbed() {
    return $("#nfid-embed")
  }

  getScreenModal() {
    return $("#screen-modal")
  }

  getReceiverICAddressInput(FT: string) {
    return $("#inputICAddress" + `${FT}`)
  }

  getFTInput(FT: string) {
    return $("#input" + `${FT}`)
  }

  getRequestFTButton(FT: string) {
    return $("#buttonRequest" + `${FT}`)
  }

  getFTDetails(FT: string) {
    if (FT == "ICP") return $("#amountICP")
    else return $("#NFTName")
  }

  async getEXTTResponseBlock(block: string) {
    return $(`div#${block} #responseID code`)
  }

  async sendICPTransaction(amount: number, address: string) {
    await this.getReceiverICAddressInput("FT").then(async (it) => {
      await it.waitForDisplayed()
      await it.setValue(address)
    })

    await this.getFTInput("ICP").then(async (it) => {
      await it.waitForDisplayed()
      await it.setValue(amount)
    })

    cucumberJson.attach(await browser.takeScreenshot(), "image/png")
    await this.getRequestFTButton("ICP").then(async (it) => {
      await it.waitForClickable()
      await it.click()
    })
  }

  async sendNFTTransaction(address: string) {
    await this.getReceiverICAddressInput("NFT").then(async (it) => {
      await it.waitForDisplayed()
      await it.setValue(address)
    })
    await this.getFTInput("NFT").then(async (it) => {
      await it.waitForClickable()
      await it.click()
    })
    await this.myNFTSelector.then(async (it) => {
      await it.waitForClickable()
      await it.click()
    })
    cucumberJson.attach(await browser.takeScreenshot(), "image/png")
    await this.getRequestFTButton("NFT").then(async (it) => {
      await it.waitForClickable()
      await it.click()
    })
  }
}

export default new DemoTransactions()
