import { HomePage } from "./home-page.js"

export class Profile extends HomePage {
  private get profilePic() {
    return $("#profile")
  }

  private get mobileProfile() {
    return $("#profile-mobile")
  }

  private get profileBurgerMenu() {
    return $("#mobile-menu")
  }

  private get tokens() {
    return $$("table tbody tr")
  }

  private get logoutButton() {
    return $("#logout")
  }

  private get vaultsTab() {
    return $("#desktop > #profile-vaults")
  }

  private get credentialsTab() {
    return $$("#profile-credentials")
  }

  private get connectPhoneNumberButton() {
    return $("#connect-mobile-phone-number")
  }

  private get phoneNumberInput() {
    return $("#phone-number")
  }

  private get verifyPhoneNumber() {
    return $("#add-phone-number")
  }

  private pinInput(number: number) {
    return `#pin-input-${number}`
  }

  private get sendPinButton() {
    return $("#send-pin")
  }

  public get getPhoneNumber() {
    return $("#phone-number-value")
  }

  public get totalBalance() {
    return $("#totalBalance")
  }

  get sendButton() {
    return $("#sendButton")
  }

  get receiveButton() {
    return $("#receiveButton")
  }

  public async openVaults() {
    await this.vaultsTab.waitForDisplayed({
      timeout: 6000,
      timeoutMsg: "Vaults tab is missing!",
    })
    await this.vaultsTab.click()
  }

  public async openCredentials(isMobile?: boolean) {
    let index = isMobile ? 0 : 1
    if (isMobile) await this.openMobileProfileMenu()
    this.credentialsTab[index].waitForDisplayed({
      timeout: 5000,
      timeoutMsg: "Creadentials tab is missing!",
    })
    this.credentialsTab[index].click()
  }

  public async connectMobilePhoneNumber() {
    await this.connectPhoneNumberButton.waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Connect Phone number",
    })
    await this.connectPhoneNumberButton.click()
  }

  public async inputAndVerifyPhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.waitForDisplayed({
      timeoutMsg: "Phone number input is missing",
    })
    await this.phoneNumberInput.setValue(phoneNumber)
    await this.verifyPhoneNumber.waitForDisplayed({
      timeoutMsg: "Verify Phone number is missing",
    })
    await this.verifyPhoneNumber.click()
  }

  public async enterPin(pinNumber: string) {
    const pinNumberArr: string[] = [...pinNumber]
    for (let i = 0; i < pinNumberArr.length; i++) {
      $(this.pinInput(i)).waitForDisplayed({
        timeout: 7000,
        timeoutMsg: `Pin Number ${i} input is missing`,
      })
      await $(this.pinInput(i)).click()
      await $(this.pinInput(i)).setValue(pinNumberArr[i])
    }
    await this.sendPinButton.waitForDisplayed({
      timeout: 6000,
      timeoutMsg: "Send Pin button is missing",
    })
    try {
      await this.sendPinButton.click()
    } catch (err) {}
  }

  public async waitForTokensAppear(amount?: number) {
    await browser.waitUntil(
      async () => (await this.tokens.length) === amount || 1,
      {
        timeout: 50000,
        timeoutMsg: "Not all tokens displayed on user profile!",
      },
    )
  }

  public async waitForTokens(amount: number) {
    await browser.waitUntil(async () => (await this.tokens.length) === amount, {
      timeout: 50000,
      timeoutMsg: "Not all tokens displayed on user profile!",
    })
  }

  public async openMobileProfileMenu() {
    await this.profileBurgerMenu.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "User mobile menu is missing",
    })
    await this.profileBurgerMenu.click()
    await this.mobileProfile.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: "Mobile Profile button is missing!",
    })
    await this.mobileProfile.waitForClickable({ timeout: 3000 })
    await this.mobileProfile.click()
  }

  public async openProfileMenu() {
    await this.profilePic.waitForDisplayed({
      timeout: 17000,
      timeoutMsg: "Profile Picture is missing!",
    })
    await this.profilePic.click()
  }

  public async getNFIDnumber() {
    return (await $("#nfid-anchor").getText()).replace(/[^0-9]+/g, "")
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
