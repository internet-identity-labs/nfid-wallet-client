import { fetchApplication } from "frontend/integration/identity-manager"

export const CheckApplicationMeta = async (context: {
  requestOrigin?: string
}) => {
  const application = await fetchApplication(
    window.location.ancestorOrigins[0] ?? "",
  )
  return application
}
