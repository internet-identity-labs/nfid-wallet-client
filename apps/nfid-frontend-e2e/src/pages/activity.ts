import { Page } from "./page.js"

export class Activity extends Page {

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
    currency: string,
    type: string,
    amount: string,
    timestamp: string,
    from: string,
    to: string,
  ) =>
    $(`//*[@id='tx-${action}-Internet Computer-${currency}-${type}-${amount*100000000}-${currency}-${timestamp}-${from}-${to}']`)
}

export default new Activity()
