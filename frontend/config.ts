export const CONFIG = {
  II_ENV: import.meta.env.VITE_II_ENV,
  II_CANISTER_ID: import.meta.env.VITE_II_CANISTER_ID,
  IDENTITY_MANAGER_CANISTER_ID: import.meta.env
    .VITE_IDENTITY_MANAGER_CANISTER_ID,
  PUB_SUB_CHANNEL_CANISTER_ID: import.meta.env.VITE_PUB_SUB_CHANNEL_CANISTER_ID,
  VERIFY_PHONE_NUMBER:
    import.meta.env.VITE_II_ENV === "production"
      ? import.meta.env.VITE_AWS_VERIFY_PHONENUMBER
      : "/verify",
}
