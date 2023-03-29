declare const FRONTEND_MODE: string

export const isProduction = () => {
  return FRONTEND_MODE === "production"
}
