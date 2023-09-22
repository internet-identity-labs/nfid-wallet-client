import { Application } from "@nfid/integration"

import { fetchApplication } from "frontend/integration/identity-manager"
import { getAppMetaFromQuery } from "frontend/integration/windows"

export const CheckApplicationMeta = async (context: {
  requestOrigin?: string
}) => {
  const applicationMetaFromUrl = getAppMetaFromQuery()
  let application: Application
  try {
    application = await fetchApplication(
      window.location.ancestorOrigins[0] ?? "",
    )
    console.debug("CheckApplicationMeta fetched", { application })
  } catch (error) {
    console.error("CheckApplicationMeta", { error })
    application = {
      name: "Unknown application",
      accountLimit: 5,
      alias: [window.location.ancestorOrigins[0]],
      domain: window.location.ancestorOrigins[0],
      isIFrameAllowed: false,
      isNftStorage: false,
    }
    console.debug("CheckApplicationMeta fallback", { application })
  }
  const applicationMeta = {
    ...application,
    ...applicationMetaFromUrl,
  }
  console.debug("CheckApplicationMeta", { applicationMeta })
  return applicationMeta
}
