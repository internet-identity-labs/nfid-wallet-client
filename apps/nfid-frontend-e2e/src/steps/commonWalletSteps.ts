import { Then, When } from "@cucumber/cucumber"
import Assets from "../pages/assets.js"
import Activity from "../pages/activity.js"
import Nft from "../pages/nft.js"
import HomePage from "../pages/home-page.js"
import Profile from "../pages/profile.js"

When(/^User goes to (.*) tab$/, async (tab: string) => {
  const tabMap: { [key: string]: any } = {
    activity: [Assets.activityTab, Activity.filterButton],
    nfts: [Assets.NFTtab, Nft.randomTokenOnNFTtab],
    tokens: [Assets.tokensTab, Assets.ManageTokensDialog.manageTokensDialogButton],
  }
  await Assets.waitUntilElementsLoadedProperly(tabMap[tab][0], tabMap[tab][1])
})

When(/^User refreshes the page$/, async () => {
  await browser.refresh()
  await HomePage.waitForLoaderDisappear()
  await Profile.menuButton.waitForClickable({ timeout: 20000 })
})

Then(/^User opens (.+) dialog window(?: of (\S+))?$/,
  async (window: string, optionalArg: string) => {
    const windows: { [key: string]: () => Promise<void> } = {
      "Receive": async () => await Assets.receiveDialog(),
      Send: async () => await Assets.sendDialog(),
      "Send nft": async () => await Assets.sendNFTDialog(),
      "Choose nft": async () => await Assets.chooseNFTinSend.click(),
      "Manage tokens": async () => await Assets.ManageTokensDialog.manageTokensDialogButton.click(),
      "Token options": async () => await (await Assets.tokenOptionsButton(optionalArg)).click(),
      "Swap": async () => await Assets.swapButton.click()
    }
    await (windows[window]?.() || Promise.reject(new Error(`Unknown dialog window: ${window}`)))
  },
)
