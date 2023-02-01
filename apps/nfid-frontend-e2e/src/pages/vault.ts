import { Vaults } from "./vaults";

export class Vault extends Vaults {

  private get membersTab() {
    return $("#tab_members");
  }

  private get policiesTab() {
    return $("#tab_policies");
  }

  private get addMemberButton() {
    return $("#add-member-trigger");
  }

  private get memberNameInput() {
    return $("[name='name']");
  }

  private get memberNfidAddressInput() {
    return $("[name='address']");
  }

  private get addMemberConfirmation() {
    return $("#add-member-button");
  }

  private get memberName() {
    return "[id*='member_";
  }

  private get addPolicyButton() {
    return $("#create-policy-trigger");
  }

  private get selectWalletDropDown() {
    return $("#select-wallet");
  }

  private get walletsList() {
    return $$("#dropdown-options label");
  }

  private get greaterThanInput() {
    return $("[name='amount']");
  }

  private get approversInput() {
    return $("[name='approvers']");
  }

  private get createPolicyButton() {
    return $("#create-policy-button");
  }

  public get policiesList() {
    return $$("#policy_row");
  }

  private get addWalletButton() {
    return $("#create-wallet-trigger");
  }

  private get walletNameInput() {
    return $("input[name='name']");
  }

  private get createWalletButton() {
    return $("#create-wallet-button");
  }

  private get walletName() {
    return "[id*='wallet_";
  }

  public async openMembersTab() {
    await this.membersTab.waitForDisplayed({ timeout: 8000, timeoutMsg: "Members tab is missing!" });
    await this.membersTab.click();
  }

  public async openPoliciestab() {
    await this.policiesTab.waitForDisplayed({ timeout: 8000, timeoutMsg: "Policies tab is missing!" });
    await this.policiesTab.click();
  }

  public async addMember(memberName: string, address: string) {
    await this.addMemberButton.waitForDisplayed({ timeout: 6000, timeoutMsg: "Add Member button is missing!" });
    await this.addMemberButton.click();
    await this.memberNameInput.waitForDisplayed({ timeoutMsg: "Member name input is missing" });
    await this.memberNameInput.setValue(memberName);
    await this.memberNfidAddressInput.waitForDisplayed({ timeoutMsg: "NFID adress input is missing!" });
    await this.memberNfidAddressInput.setValue(address);
    await this.addMemberConfirmation.waitForDisplayed({ timeoutMsg: "Add member confirmation is required!" });
    await this.addMemberConfirmation.click();
  }

  public async getMemberByName(memberName: string) {
    await $(this.memberName + `${memberName}` + "']")
      .waitForDisplayed({ timeout: 7000, timeoutMsg: "Member has not been created! Missing member name!" });
    return await $(this.memberName + `${memberName}` + "']");
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
    await $(this.walletName + `${name}` + "']")
      .waitForDisplayed({ timeout: 7000, timeoutMsg: "Wallet has not been created! Missing wallet name!" });
    return await $(this.walletName + `${name}` + "']");
  }

  public async addPolicy(walletName: string, greaterThan: number, approvers: number) {
    await this.addPolicyButton.waitForDisplayed({ timeout: 6000, timeoutMsg: "Add Policy button is missing!" });
    await this.addPolicyButton.click();
    await this.selectWalletDropDown.waitForDisplayed({ timeout: 4000 });
    await this.selectWalletDropDown.click();
    await browser.waitUntil(
      async () =>
        (await this.walletsList.length > 0),
      { timeout: 6000, timeoutMsg: "Wallets are not on the list" }
    );

    await this.walletsList.forEach(async (wallet) => {
      if (await wallet.getText() === walletName) {
        await wallet.click();
      }
    })

    await this.greaterThanInput.setValue(greaterThan);
    await this.approversInput.setValue(approvers);
    await this.createPolicyButton.waitForClickable();
    await this.createPolicyButton.click();
  }

}

export default new Vault();
