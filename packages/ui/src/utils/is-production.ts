declare const FRONTEND_MODE: string

export const isProduction = () => {
  try {
    return FRONTEND_MODE === "production"
  } catch (_e) {
    return false
  }
}
