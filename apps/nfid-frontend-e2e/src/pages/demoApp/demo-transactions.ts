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
    await this.getReceiverICAddressInput("FT").waitForDisplayed()
    await this.getReceiverICAddressInput("FT").setValue(address)

    await this.getFTInput("ICP").waitForDisplayed()
    await this.getFTInput("ICP").setValue(amount)

    await this.getRequestFTButton("ICP").waitForClickable()
    await this.getRequestFTButton("ICP").click()
  }

  async sendNFTTransaction(address: string) {
    await browser.waitUntil(
      async () => {
        try {
          await this.getReceiverICAddressInput("NFT")
            .waitForDisplayed({ timeout: 5000 })
          await this.getReceiverICAddressInput("NFT").setValue(address)

          await this.getFTInput("NFT").waitForClickable({ timeout: 5000 })
          await this.getFTInput("NFT").click()

          await this.myNFTSelector.waitForClickable({ timeout: 5000 })
          await this.myNFTSelector.click()

          await this.getRequestFTButton("NFT")
            .waitForClickable({ timeout: 10000 })
          await this.getRequestFTButton("NFT").click()
          return true
        } catch (e) {
          /*empty*/
        }
      },
      { timeout: 30000, timeoutMsg: `Can't send NFT` },
    )
  }
}

export default new DemoTransactions()
