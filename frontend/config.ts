const BACKEND_MODE = import.meta.env.VITE_BACKEND_MODE
const FRONTEND_MODE = import.meta.env.VITE_FRONTEND_MODE

export const CONFIG = {
  FRONTEND_MODE,
  USERGEEK_API_KEY: import.meta.env.VITE_USERGEEK_API_KEY,
  IC_HOST: import.meta.env.VITE_IC_HOST as string,
  II_ENV: import.meta.env.VITE_II_MODE,
  II_CANISTER_ID: import.meta.env[`VITE_II_CANISTER_ID_${BACKEND_MODE}`],
  IDENTITY_MANAGER_CANISTER_ID: import.meta.env[
    `VITE_IDENTITY_MANAGER_CANISTER_ID_${BACKEND_MODE}`
  ],
  PUB_SUB_CHANNEL_CANISTER_ID: import.meta.env[
    `VITE_PUB_SUB_CHANNEL_CANISTER_ID_${BACKEND_MODE}`
  ],
  VERIFY_PHONE_NUMBER:
    FRONTEND_MODE === "production"
      ? import.meta.env.VITE_AWS_VERIFY_PHONENUMBER
      : "/verify",
}
