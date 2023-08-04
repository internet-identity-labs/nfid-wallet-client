import { Page } from "./page.js"

export class Activity extends Page {
  get pageTitle() {
    return $("#page_title")
  }
  get activityTableRows() {
    return $$("#activity-table tbody .activity-row")
  }

  async getActivitiesLength() {
    await browser.waitUntil(
      async () => (await this.activityTableRows).length > 0,
      {
        timeout: 5000,
        timeoutMsg: "No activities found",
      },
    )

    return await $$("#activity-table tbody .activity-row").length
  }

  async getTransaction(
    action: string,
    chain: string,
    currency: string,
    type: string,
    asset: string,
    timestamp: string,
    from: string,
    to: string,
  ) {
    if (type === "ft")
      return $(
        `#tx-${action}-${chain}-${currency}-${type}-${asset}-${timestamp}-${from}-${to}`.replace(
          ".",
          "_",
        ),
      )
    else
      return $(
        `#tx-${action}-${chain}-${type}-${asset}-${timestamp}-${from}-${to}`.replace(
          ".",
          "_",
        ),
      )
  }
}

export default new Activity()
