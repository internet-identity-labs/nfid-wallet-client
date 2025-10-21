import { Page } from "./page.js"

export class Activity extends Page {
  async allActivityTable() {
    const firstRow = $("#activity-table tr")
    await firstRow.waitForDisplayed({
      timeout: 50000,
      timeoutMsg: "Transactions wasn't loaded in 50 sec on Activity page",
    })
    return $$("#activity-table tr")
  }

  get activityTableRows() {
    return $$("//*[@id='activity-table']//tr[starts-with(@id, 'tx-')]")
  }

  get filterButton() {
    return $("#filter-ft")
  }

  get numberOfFilters() {
    return $("#number_of_filters")
  }

  async filterName(filterName: string) {
    return $(`#option_${filterName.replace(/\s+/g, "")}`)
  }

  async rowDate(row: ChainablePromiseElement) {
    return $(`${row.selector} #activity-table-row-date`)
  }

  async rowActionType(row: ChainablePromiseElement) {
    return row.$("#activity-table-row-action")
  }

  async getActivitiesLength() {
    await browser.waitUntil(
      async () => await (this.activityTableRows).length > 0,
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
    $(
      `//*[@id='tx-${action}-${currency}-${type}-${
        Number(amount) * 100000000
      }-${currency}-${timestamp}-${from}-${to}']`,
    )
}

export default new Activity()
