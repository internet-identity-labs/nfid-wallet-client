declare const FRONTEND_MODE: string

export const isProduction = () => {
  console.debug("isProduction", FRONTEND_MODE)
  return FRONTEND_MODE === "production"
}
