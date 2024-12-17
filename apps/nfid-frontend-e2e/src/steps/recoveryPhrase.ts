import { Then, When } from "@cucumber/cucumber"

import userClient from "../helpers/accounts-service.js"

When(
  /^User enters recovery phrase of ([^"]*) anchor$/,
  {
    wrapperOptions: {
      retry: 2,
    },
  },
  async function (anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    return (await $("[name='recoveryPhrase']")).setValue(testUser.seed)
  },
)

When(/^User clicks on recover button$/, async () => {
  await $("#recovery-button").click()
})

Then(/^User toggle checkbox "([^"]*)?"$/, async function (selector: string) {
  await $(selector).click()
})
