import { HomePage } from "./home-page";


export class Profile extends HomePage {

  private get profilePic() {
    return $("#profile");
  }

  private get logoutButton() {
    return $("#logout");
  }

  private get vaultsTab() {
    return $("#desktop > #profile-vaults");
  }

  public async openVaults() {
    await this.vaultsTab.waitForDisplayed({timeout: 6000, timeoutMsg: "Vaults tab is missing!"})
    await this.vaultsTab.click();
  }

  public async openProfileMenu() {
    await this.profilePic.waitForDisplayed({ timeout: 7000, timeoutMsg: "Profile Picture is missing!" });
    await this.profilePic.click();
  }

  public async logout() {
    await this.logoutButton.waitForDisplayed({ timeout: 5000, timeoutMsg: "Logout button is missing!" });
    await this.logoutButton.click();
  }

}

export default new Profile();
