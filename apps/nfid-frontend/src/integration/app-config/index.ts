// Code allowing third parties to configure their apps will go here
import { Application, fetchApplications } from "../identity-manager"
import { rmTrailingSlash } from "../identity-manager/persona/utils"

// NOTE: make sure to sanitize application meta
function selectApplication(
  hostname: string,
  applications: Application[],
): Application | undefined {
  const app = applications.find((a) => rmTrailingSlash(a.domain) === hostname)
  return app
}

export async function fetchAccountLimit(hostname: string): Promise<number> {
  console.debug("fetchAccountLimit", { hostname })
  const applications = await fetchApplications()
  console.debug("fetchAccountLimit", { applications })
  return selectApplication(hostname, applications)?.accountLimit ?? 5
}
