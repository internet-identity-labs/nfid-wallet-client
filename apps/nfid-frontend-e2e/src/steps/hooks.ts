import { After, Before } from "@cucumber/cucumber"
import cucumberJson from "wdio-cucumberjs-json-reporter"
import userClient from "../helpers/accounts-service"

Before(async function () {
  for (let i = 0; i < userClient.userMap.size; i++) {
    if (userClient.userMap.get(userClient.users[i]) === false) {
      await userClient.takeUser(userClient.users[i])
      this.testUser = userClient.users[i]
    }
  }
})

After(async function () {
  // @ts-ignore
  if (browser.capabilities.browserName === "chrome") {
    const browserLogs = await browser.getLogs("browser")
    cucumberJson.attach(
      JSON.stringify(browserLogs, null, 2),
      "application/json",
    )
  }

  userClient.releaseUser(this.testUser)
})
