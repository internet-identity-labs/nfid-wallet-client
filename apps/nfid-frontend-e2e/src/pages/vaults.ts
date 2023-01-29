import { Profile } from "./profile";


class Vaults extends Profile {

  private get createVaultButton() {
    return $("#create-vault-trigger");
  }

  private get vaultNameInput() {
    return $("[name='vaultName']");
  }

  private get createVaultConfirmationButton() {
    return $("#create-vault-button");
  }

  private get vaultId() {
    return "[id*='vault_";
  }

  public async createVault(vaultName: string) {
    await this.createVaultButton.waitForDisplayed({ timeout: 5000, timeoutMsg: "Add Vault button is missing!" });
    await this.createVaultButton.click();
    await this.vaultNameInput.waitForDisplayed({ timeout: 4000, timeoutMsg: "Vault name input is missing!" })
    await this.vaultNameInput.setValue(vaultName);
    await this.createVaultConfirmationButton.waitForDisplayed({ timeout: 4000, timeoutMsg: "Create Vault button is missing!" });
    await this.createVaultConfirmationButton.click();
  }

  public async getVaultById(name: string) {
    await $(this.vaultId + `${name}` + "']")
      .waitForDisplayed({ timeout: 7000, timeoutMsg: "Vault has not been created! Missing vault id!" });
  }

}

export default new Vaults();
