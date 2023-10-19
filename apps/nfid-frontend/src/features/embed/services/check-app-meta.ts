import { Application } from "@nfid/integration"

import { fetchApplication } from "frontend/integration/identity-manager"
import { getAppMetaFromQuery } from "frontend/integration/windows"

export const CheckApplicationMeta = async () => {
  const applicationMetaFromUrl = getAppMetaFromQuery()
  let application: Application
  const requesterDomain = window.location.ancestorOrigins
    ? window.location.ancestorOrigins[0]
    : window.document.referrer
  try {
    application = await fetchApplication(requesterDomain)
    console.debug("CheckApplicationMeta fetched", { application })
  } catch (error) {
    console.error("CheckApplicationMeta", { error })
    application = {
      name: "Unknown application",
      accountLimit: 5,
      alias: [requesterDomain],
      domain: requesterDomain,
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
