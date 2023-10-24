import {demoAppPage} from "./demoApp-page.js"

export class DemoTransactions extends demoAppPage {

  get myNFTSelector() {
    return $('#option_3hfnf-vakor-uwiaa-aaaaa-b4atg-aaqca-aacgm-a span:first-of-type')
  }

  get getApproveButton() {
    return $(`#approveButton div`)
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
    if (FT == "ICP") return $('#amountICP')
    else return $('#NFTName')
  }

  async sendICPTransaction(amount: number, address: string) {
    await this.getReceiverICAddressInput("FT").setValue(address)
    await this.getFTInput("ICP").setValue(amount)
    await this.getRequestFTButton("ICP").click()
  }

  async sendNFTTransaction(address: string) {
    await this.getReceiverICAddressInput("NFT").setValue(address)
    await this.getFTInput("NFT").click()
    await this.myNFTSelector.click()
    await this.getRequestFTButton("NFT").click()
  }
}

export default new DemoTransactions()
