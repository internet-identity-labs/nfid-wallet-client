export const CONFIG = {
  II_ENV: import.meta.env.VITE_II_ENV,
  II_CANISTER_ID: import.meta.env.VITE_II_CANISTER_ID,
  MP_CANISTER_ID: import.meta.env.VITE_MP_CANISTER_ID,
  VERIFY_PHONE_NUMBER:
    import.meta.env.VITE_II_ENV === "production"
      ? import.meta.env.VITE_AWS_VERIFY_PHONENUMBER
      : "/verify",
}
