import { Page } from "./page.js"

export class Activity extends Page {
  get pageTitle() {
    return $("#page_title")
  }

  get activityTableRows() {
    return $$("//*[@id='activity-table']//tr[starts-with(@id, 'tx-')]")
  }

  get filterButton() {
    return $("#filter-ft")
  }

  async getActivitiesLength() {
    await browser.waitUntil(
      async () => (await this.activityTableRows).length > 0,
      {
        timeout: 15000,
        timeoutMsg: "No activities found",
      },
    )

    return await this.activityTableRows.length
  }

  getTransaction = async (
    action: string,
    chain: string,
    currency: string,
    type: string,
    asset: string,
    timestamp: string,
    from: string,
    to: string,
  ) =>
    $(`//*[@id='tx-${action}-${chain}-${currency}-${type}-${asset}-${timestamp}-${from}-${to}']`)
}

export default new Activity()
