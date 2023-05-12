import { When } from "@wdio/cucumber-framework"

import { baseUrl } from "../../wdio.conf.js"
import userClient from "../helpers/accounts-service.js"
import Profile from "../pages/profile.js"
import clickElement from "./support/actions/clickElement.js"

When(/^I (click|doubleclick) on the (link|selector) ([^"]*)?$/, clickElement)

When(
  /^User is already authenticated with ?(?:(.*))?$/,
  async function (account: string) {
    if (account === "BTC") {
      for (let i = 0; i < userClient.userMap.size; i++) {
        if (
          userClient.userMap.get(userClient.users[i]) === false &&
          userClient.users[i].btcAddress !== undefined
        ) {
          await userClient.takeUser(userClient.users[i])
          this.testUser = userClient.users[i]
        }
      }
    } else {
      for (let i = 0; i < userClient.userMap.size; i++) {
        if (userClient.userMap.get(userClient.users[i]) === false) {
          await userClient.takeUser(userClient.users[i])
          this.testUser = userClient.users[i]
        }
      }
    }

    let testUser: TestUser = this.testUser

    const authId = await browser.addVirtualAuthenticator(
      "ctap2",
      "internal",
      true,
      true,
      true,
      true,
    )

    const rpId = new URL(baseUrl).hostname
    const creds: WebAuthnCredential = testUser.credentials
    const anchor: JSON = testUser.account

    // @ts-ignore
    await browser.addCredentialV2(
      authId,
      rpId,
      creds.credentialId,
      creds.isResidentCredential,
      creds.privateKey,
      creds.signCount,
    )

    await browser.execute(
      function (key, value) {
        // @ts-ignore
        return this.localStorage.setItem(key, value)
      },
      "account",
      JSON.stringify(anchor),
    )
    await browser.execute(function () {
      // @ts-ignore
      return this.location.reload()
    })
  },
)

When(/^Tokens displayed on user assets$/, async () => {
  await Profile.waitForTokensAppear()
})

When(/^User opens profile menu$/, async () => {
  await Profile.openProfileMenu()
})
