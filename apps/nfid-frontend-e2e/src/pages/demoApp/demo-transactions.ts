import cucumberJson from "wdio-cucumberjs-json-reporter"

import { demoAppPage } from "./demoApp-page.js"

export class DemoTransactions extends demoAppPage {
  get myNFTSelector() {
    return $(
      "#option_3hfnf-vakor-uwiaa-aaaaa-b4atg-aaqca-aacgm-a span:first-of-type",
    )
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
    await this.getReceiverICAddressInput("FT").setValue(address)
    await this.getFTInput("ICP").setValue(amount)
    cucumberJson.attach(await browser.takeScreenshot(), "image/png")
    await this.getRequestFTButton("ICP").click()
  }

  async sendNFTTransaction(address: string) {
    await this.getReceiverICAddressInput("NFT").setValue(address)
    await this.getFTInput("NFT").click()
    await this.myNFTSelector.click()
    cucumberJson.attach(await browser.takeScreenshot(), "image/png")
    await this.getRequestFTButton("NFT").then(async (it) => {
      await it.waitForClickable()
      await it.click()
    })
  }
}

export default new DemoTransactions()
