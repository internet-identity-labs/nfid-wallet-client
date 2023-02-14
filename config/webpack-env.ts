import * as childProcess from "child_process"

const sentryRelease = childProcess
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .slice(0, 12)

export const serviceConfig = {
  SENTRY_RELEASE: JSON.stringify(sentryRelease),
  NFID_PROVIDER_URL: JSON.stringify(process.env.NFID_PROVIDER_URL),
  IS_E2E_TEST: JSON.stringify(process.env.IS_E2E_TEST),
  IC_HOST: JSON.stringify(process.env.IC_HOST),
  II_ENV: JSON.stringify(process.env.II_MODE),
  CURRCONV_TOKEN: JSON.stringify(process.env.CURRCONV_TOKEN),
  ETHERSCAN_API_KEY: JSON.stringify(process.env.ETHERSCAN_API_KEY),
  ALCHEMY_API_KEY: JSON.stringify(process.env.ALCHEMY_API_KEY),
  FRONTEND_MODE: JSON.stringify(process.env.FRONTEND_MODE),
  IS_DEV: JSON.stringify(process.env.IS_DEV),
  USERGEEK_API_KEY: JSON.stringify(process.env.USERGEEK_API_KEY),
  GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
  VERIFY_PHONE_NUMBER: JSON.stringify(
    process.env.FRONTEND_MODE === "production"
      ? process.env.AWS_VERIFY_PHONENUMBER
      : "/verify",
  ),
  AWS_SYMMETRIC: JSON.stringify(process.env.AWS_SYMMETRIC),
  AWS_AUTH_STATS: JSON.stringify(process.env.AWS_AUTH_STATS),
  SIGNIN_GOOGLE: JSON.stringify(
    process.env.FRONTEND_MODE === "production"
      ? process.env.AWS_SIGNIN_GOOGLE
      : "/signin",
  ),
  INTERNET_IDENTITY_CANISTER_ID: JSON.stringify(
    process.env.INTERNET_IDENTITY_CANISTER_ID,
  ),
  IDENTITY_MANAGER_CANISTER_ID: JSON.stringify(
    process.env.IDENTITY_MANAGER_CANISTER_ID,
  ),
  PUB_SUB_CHANNEL_CANISTER_ID: JSON.stringify(
    process.env.PUB_SUB_CHANNEL_CANISTER_ID,
  ),
  VERIFIER_CANISTER_ID: JSON.stringify(process.env.VERIFIER_CANISTER_ID),
  LEDGER_CANISTER_ID: JSON.stringify(process.env.LEDGER_CANISTER_ID),
  CYCLES_MINTER_CANISTER_ID: JSON.stringify(
    process.env.CYCLES_MINTER_CANISTER_ID,
  ),
  VAULT_CANISTER_ID: JSON.stringify(process.env.VAULT_CANISTER_ID),
  II_PROVIDER: JSON.stringify(process.env.II_PROVIDER),
  ETH_SECRET_STORAGE_CANISTER_ID: JSON.stringify(
    process.env.ETH_SECRET_STORAGE_CANISTER_ID,
  ),
  METAMASK_SIGNIN_MESSAGE: JSON.stringify(process.env.METAMASK_SIGNIN_MESSAGE),
  WALLET_CONNECT_PROJECT_ID: JSON.stringify(
    process.env.WALLET_CONNECT_PROJECT_ID,
  ),
  ECDSA_SIGNER_CANISTER_ID: JSON.stringify(
    process.env.ECDSA_SIGNER_CANISTER_ID,
  ),
  RAMP_WALLET_API_KEY: JSON.stringify(
    process.env.RAMP_WALLET_API_KEY,
  ),
  RAMP_WALLET_SDK_URL: JSON.stringify(
    process.env.RAMP_WALLET_SDK_URL,
  ),
}
