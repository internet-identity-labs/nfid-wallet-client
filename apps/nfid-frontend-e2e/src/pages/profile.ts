import { HomePage } from "./home-page"

export class Profile extends HomePage {
  private get profilePic() {
    return $("#profile")
  }

  private get mobileProfile() {
    return $$("div button")[3];
  }

  private get tokens() {
    return $$("table+div > div");
  }

  private get logoutButton() {
    return $("#logout")
  }

  private get vaultsTab() {
    return $("#desktop > #profile-vaults")
  }

  public async openVaults() {
    await this.vaultsTab.waitForDisplayed({ timeout: 6000, timeoutMsg: "Vaults tab is missing!" })
    await this.vaultsTab.click();
  }

  public async waitForTokensAppear() {
    await browser.waitUntil(
      async () => (await this.tokens.length) > 1,
      {
        timeout: 10000,
        timeoutMsg: "Tokens are not displayed on user profile!"
      }
    );
  }

  public async openMobileProfileMenu() {
    await this.mobileProfile.waitForDisplayed({ timeout: 5000, timeoutMsg: "Mobile Profile button is missing!" });
    await this.mobileProfile.waitForClickable({ timeout: 3000 });
    await this.mobileProfile.click();
  }

  public async openProfileMenu() {
    await this.profilePic.waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Profile Picture is missing!",
    })
    await this.profilePic.click()
  }

  public async getNFIDnumber() {
    return $("div button  p");
  }

  public async logout() {
    await this.logoutButton.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: "Logout button is missing!",
    })
    await this.logoutButton.click()
  }
}

export default new Profile()
