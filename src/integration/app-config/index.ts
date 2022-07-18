// Code allowing third parties to configure their apps will go here
import { Application, fetchApplications } from "../identity-manager"

// NOTE: make sure to sanitize application meta
function selectApplication(
  hostname: string,
  applications: Application[],
): Application | undefined {
  const app = applications.find((a) => a.domain === hostname)
  return app
}

export async function fetchAccountLimit(hostname: string): Promise<number> {
  const applications = await fetchApplications()
  return selectApplication(hostname, applications)?.accountLimit ?? 5
}
