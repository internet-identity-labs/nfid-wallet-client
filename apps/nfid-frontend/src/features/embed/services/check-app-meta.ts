import { Application } from "@nfid/integration"
import { getAppMetaFromQuery } from "frontend/integration/windows"

export const CheckApplicationMeta = async (): Promise<Application> => {
  const applicationMetaFromUrl = getAppMetaFromQuery()

  const requesterDomain = window.location.ancestorOrigins
    ? window.location.ancestorOrigins[0]
    : window.document.referrer

  const applicationMeta: Application = {
    ...applicationMetaFromUrl,
    name: applicationMetaFromUrl.name || "application missing",
    domain: requesterDomain,
  }
  console.debug("CheckApplicationMeta", { applicationMeta })
  return applicationMeta
}
