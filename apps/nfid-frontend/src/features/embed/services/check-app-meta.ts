import { Application } from "@nfid/integration"

import { fetchApplication } from "frontend/integration/identity-manager"

export const CheckApplicationMeta = async (context: {
  requestOrigin?: string
}) => {
  let application: Application
  try {
    application = await fetchApplication(
      window.location.ancestorOrigins[0] ?? "",
    )
  } catch (e) {
    application = {
      name: "Unknown application",
      accountLimit: 5,
      alias: [window.location.ancestorOrigins[0]],
      domain: window.location.ancestorOrigins[0],
      isIFrameAllowed: false,
      isNftStorage: false,
    }
    console.log("Error fetching application", e)
  }
  return application
}
