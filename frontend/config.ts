const mode = import.meta.env.VITE_BACKEND_MODE

export const CONFIG = {
  IC_HOST: import.meta.env.VITE_IC_HOST as string,
  II_ENV: import.meta.env.VITE_II_MODE,
  II_CANISTER_ID: import.meta.env[`VITE_II_CANISTER_ID_${mode}`],
  IDENTITY_MANAGER_CANISTER_ID: import.meta.env[
    `VITE_IDENTITY_MANAGER_CANISTER_ID_${mode}`
  ],
  PUB_SUB_CHANNEL_CANISTER_ID: import.meta.env[
    `VITE_PUB_SUB_CHANNEL_CANISTER_ID_${mode}`
  ],
  VERIFY_PHONE_NUMBER:
    import.meta.env.VITE_FRONTEND_MODE === "production"
      ? import.meta.env.VITE_AWS_VERIFY_PHONENUMBER
      : "/verify",
}
