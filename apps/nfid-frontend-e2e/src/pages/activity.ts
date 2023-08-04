export class Activity {
  get pageTitle() {
    return $("#page_title")
  }

  async getActivitiesLength() {
    await browser.waitUntil(
      async () => (await $$("#activity-table tbody .activity-row")).length > 0,
      {
        timeout: 5000,
        timeoutMsg: "No activities found",
      },
    )
    console.log(await $$("#activity-table tbody .activity-row").length)
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
    await browser.waitUntil(() => 1 === 2)

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
