import { HomePage } from "./home-page";


class Profile extends HomePage {

  private get profilePic() {
    return $("#profile");
  }

  private get logoutButton() {
    return $("#logout");
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
