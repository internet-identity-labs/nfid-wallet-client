import { Then, When } from "@cucumber/cucumber"

import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import HomePage from "../pages/home-page.js"
import Nft from "../pages/nft.js"
import Profile from "../pages/profile.js"
import Staking from "../pages/staking.js"

When(/^User goes to (.*) tab$/, async (tab: string) => {
  const tabMap: { [key: string]: any } = {
    Activity: [Assets.activityTab, Activity.filterButton],
    NFTs: [Assets.NFTtab, Nft.randomTokenOnNFTtab],
    Staking: [
      Assets.stakingTab,
      Staking.stakedToken("NFIDWallet").detailsButton,
    ],
    Tokens: [
      Assets.tokensTab,
      {
        element: Assets.ManageTokensDialog.manageTokensDialogButton,
        action: async (element: ChainablePromiseElement) => {
          await element.waitForDisplayed({ timeout: 20000 })
          await element.waitForClickable()
        },
      },
    ],
  }
  await Assets.waitUntilElementsLoadedProperly(tabMap[tab][0], tabMap[tab][1])
})

When(/^User refreshes the page$/, async () => {
  await browser.refresh()
  await HomePage.waitForLoaderDisappear()
  await Profile.menuButton.waitForClickable({ timeout: 20000 })
})

Then(
  /^User opens (.+) dialog window(?: of (\S+))?$/,
  async (window: string, optionalArg: string) => {
    const clickWithWait = async (element: WebdriverIO.Element) => {
      await element.waitForClickable({ timeout: 20000 })
      await element.click()
    }

    const windows: { [key: string]: () => Promise<void> } = {
      Receive: async () => await Assets.receiveDialog(),
      Send: async () => await Assets.sendDialog(),
      "Send nft": async () => await Assets.sendNFTDialog(),
      "Choose nft": async () =>
        await clickWithWait(await Assets.chooseNFTinSend),
      "Manage tokens": async () =>
        await clickWithWait(
          await Assets.ManageTokensDialog.manageTokensDialogButton,
        ),
      "Token options": async () =>
        await clickWithWait(await Assets.tokenOptionsButton(optionalArg)),
      Swap: async () => await clickWithWait(await Assets.swapButton),
      Stake: async () => await Staking.stakeButton.click(),
    }
    await (windows[window]?.() ||
      Promise.reject(new Error(`Unknown dialog window: ${window}`)))
  },
)
