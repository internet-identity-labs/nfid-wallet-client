import { Then, When } from "@cucumber/cucumber"

import { softAssertAll } from "../helpers/assertions.js"
import Assets from "../pages/assets.js"

When(/^User selects the (.*) NFT$/, async (tokenName: string) => {
  await Assets.getTokenByNameInSend(tokenName).click()
})

When(/^User switches send type$/, async () => {
  await Assets.switchSendType.click()
})

When(/^User clicks the back button in Send window$/, async () => {
  await Assets.waitUntilElementsLoadedProperly(
    Assets.backButtonInSendWindow,
    Assets.switchSendType,
  )
})

Then(
  /^Verifying that user sees option ([^"]*) in dropdown/,
  async (option: string) => {
    await Assets.getTokenByNameInSend(option).waitForExist({ timeout: 15000 })
  },
)

Then(/^User selects ([^"]*) from send options/, async (currency: string) => {
  await Assets.openAssetOptionsOnSR()
  await Assets.currencyOption(currency.replace(/^\$/, ""))
    .then(async (it) => {
      await it.waitForClickable({ timeout: 20000 })
      await it.click()
    })
})

Then(
  /^Verifying that the balance is calculated as ([^"]*) and fee is calculated as ([^"]*)/,
  async (balance: string, fee: string) => {
    await softAssertAll(
      async () =>
        expect(await Assets.getSourceTokenBalance.getText()).toContain(balance),
      async () => expect(await Assets.getFee.getText()).toContain(fee),
    )
  },
)

Then(
  /^User sets address to (.+) then clicks the "Send" button(?: ([^"]*) FT)?$/,
  async (address: string, amount: string) => {
    amount
      ? await Assets.sendFTto(address, amount)
      : await Assets.sendNFTto(address)
  },
)

Then(/^User sets the amount to ([^"]*)/, async (amount: string) => {
  await Assets.amountField.setValue(amount)
})

Then(/^Verifying that the transaction is success$/, async () => {
  await Assets.successWindow.waitForExist({
    timeout: 80000,
    interval: 1000,
  })
})

Then(
  /^Verifying that the Account ID is ([^"]*) and the Principal is ([^"]*)/,
  async function(account: string, principal: string) {
    const currentAddress = await Assets.getAccountId(true)
    let currentPrincipal = await Assets.getAccountId(false)

    await softAssertAll(
      async () =>
        await expect(
          (await currentAddress.firstAddressPart.getText()) +
          "..." +
          (await currentAddress.secondAddressPart.getText()),
        ).toEqual(account),
      async () =>
        await expect(
          (await currentPrincipal.firstAddressPart.getText()) +
          "..." +
          (await currentPrincipal.secondAddressPart.getText()),
        ).toEqual(principal),
    )
  },
)
