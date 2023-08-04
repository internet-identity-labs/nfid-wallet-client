import { ethActivityConnector } from "./eth/eth-activity-connector"

const activityConnectors = [ethActivityConnector]

export const getAllActivity = async () => {
  const activitiesArray = await Promise.all(
    activityConnectors.map(async (connector) => {
      return await connector.getGroupedActivitiesRows()
    }),
  )

  return activitiesArray.flat()
}
