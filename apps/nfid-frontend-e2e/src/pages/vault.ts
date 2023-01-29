import { Vaults } from "./vaults";

export class Vault extends Vaults {

  private get addWalletButton() {
    return $("#create-wallet-trigger");
  }

  private get walletNameInput() {
    return $("input[name='name']");
  }

  private get createWalletButton() {
    return $("#create-wallet-button");
  }

  private get walletId() {
    return "[id*='wallet_";
  }

  public async addWallet(walletName: string) {
    await this.addWalletButton.waitForDisplayed({ timeout: 4000, timeoutMsg: "Add Wallet is missing!" });
    await this.addWalletButton.click();
    await this.walletNameInput.waitForDisplayed({ timeout: 3000, timeoutMsg: "Input Wallet name is missing!" });
    await this.walletNameInput.setValue(walletName);
    await this.createWalletButton.waitForDisplayed({ timeout: 3000, timeoutMsg: "Create Wallet is missing!" });
    await this.createWalletButton.click();
  }

  public async getWalletByName(name: string) {
    await $(this.walletId + `${name}` + "']")
      .waitForDisplayed({ timeout: 7000, timeoutMsg: "Vault has not been created! Missing vault id!" });
    return await $(this.walletId + `${name}` + "']");
  }

}

export default new Vault();
