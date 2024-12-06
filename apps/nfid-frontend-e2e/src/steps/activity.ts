import { Then } from "@cucumber/cucumber"
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
      currency,
      type,
      amount,
      timestamp,
      from,
      to,
    )
    await tx.waitForExist()
  },
)
