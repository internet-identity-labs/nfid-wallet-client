import { Then, When } from "@cucumber/cucumber"

import Activity from "../pages/activity.js"

Then(
  /^Verifying that there are (\d+) activities in the table$/,
  async (amount: number) => {
    expect(await Activity.getActivitiesLength()).toEqual(amount)
  },
)

Then(
  /^Verifying that there is the transaction with action type ([^"]*), currency ([^"]*), type ([^"]*), amount ([^"]*), timestamp ([^"]*), "From" field ([^"]*) and "To" field ([^"]*)$/,
  async (
    action: string,
    currency: string,
    type: string,
    amount: string,
    timestamp: string,
    from: string,
    to: string,
  ) => {
    const tx = await Activity.getTransaction(
      action,
      currency.replace(/^\$/, ""),
      type,
      amount,
      timestamp,
      from,
      to,
    )
    await tx.waitForExist()
  },
)

Then(
  /^Verifying that swap transactions are stored in activity table$/,
  async () => {
    const tableRows = await Activity.allActivityTable()
    const actualDate = (
      await (await Activity.rowDate(tableRows[1])).getText()
    ).replace(/\s?[ap]m$/, "")
    await browser.waitUntil(
      async () => {
        await browser.refresh()
        const [hours, minutes, seconds] = actualDate.split(":").map(Number)
        const now = new Date()
        const expectedTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          seconds,
        )
        const timeDifference = Math.abs(now.getTime() - expectedTime.getTime())
        await (await Activity.rowActionType(tableRows[1])).waitForDisplayed(
          {
            timeout: 50000,
            timeoutMsg: "List of transactions wasn't loaded in 70sec",
          },
        )
        return (
          (await (await Activity.rowActionType(tableRows[1])).getText()) ==
          "Sent" && timeDifference < 150000
        )
      },
      { timeout: 150000, timeoutMsg: "Time difference is more than 150sec" },
    )
  },
)

When("User sets filter to {list}", async (filtersList: string[]) => {
  await Activity.filterButton.waitForDisplayed({
    timeout: 50000,
  })
  await Activity.filterButton.click()
  await Activity.numberOfFilters.waitForDisplayed({
    timeout: 30000,
  })
  await Activity.numberOfFilters.click()
  for (const filter of filtersList) {
    await (await Activity.filterName(filter)).click()
    await browser.pause(500)
    await Activity.numberOfFilters.waitForDisplayed({ timeout: 20000 })
  }
  expect(await Activity.numberOfFilters.getText()).toEqual(`${filtersList.length} selected`)
})
