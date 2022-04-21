declare const FRONTEND_MODE: string

export const CONFIG = {
  USERGEEK_API_KEY: process.env.REACT_APP_USERGEEK_API_KEY,
  VERIFY_PHONE_NUMBER:
    FRONTEND_MODE === "production"
      ? process.env.REACT_APP_AWS_VERIFY_PHONENUMBER
      : "/verify",
}

console.log(">> ", { CONFIG })
