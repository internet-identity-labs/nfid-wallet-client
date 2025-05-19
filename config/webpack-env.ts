import * as childProcess from "child_process"

import canisterIds from "../canister_ids.json"

let sdkGitHash
try {
  sdkGitHash = childProcess
    .execSync("cd ../../../sdk-ts/ && git rev-parse HEAD")
    .toString()
    .trim()
    .slice(0, 12)
} catch (e) {
  sdkGitHash = "unknown"
}

export const serviceConfig = {
  SDK_GIT_HASH: JSON.stringify(sdkGitHash),
  CANISTER_IDS: JSON.stringify(canisterIds),
  NFID_PROVIDER_URL: JSON.stringify(process.env.NFID_PROVIDER_URL),
  IS_E2E_TEST: JSON.stringify(process.env.IS_E2E_TEST),
  IC_HOST: JSON.stringify(process.env.IC_HOST),
  II_MODE: JSON.stringify(process.env.II_MODE),
  FRONTEND_MODE: JSON.stringify(process.env.FRONTEND_MODE),
  ENV: JSON.stringify(process.env.ENV),
  IS_DEV: JSON.stringify(process.env.IS_DEV),
  USERGEEK_API_KEY: JSON.stringify(process.env.USERGEEK_API_KEY),
  GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
  VERIFY_PHONE_NUMBER: JSON.stringify(
    process.env.FRONTEND_MODE === "production"
      ? process.env.AWS_VERIFY_PHONENUMBER
      : "/verify",
  ),
  AWS_SYMMETRIC: JSON.stringify(process.env.AWS_SYMMETRIC),
  AWS_EXCHANGE_RATE: JSON.stringify(process.env.AWS_EXCHANGE_RATE),
  AWS_X_TWEET: JSON.stringify(process.env.AWS_X_TWEET),
  AWS_SEND_VERIFICATION_EMAIL: JSON.stringify(
    process.env.AWS_SEND_VERIFICATION_EMAIL,
  ),
  AWS_LINK_GOOGLE_ACCOUNT: JSON.stringify(process.env.AWS_LINK_GOOGLE_ACCOUNT),
  AWS_CHECK_VERIFICATION: JSON.stringify(process.env.AWS_CHECK_VERIFICATION),
  AWS_VERIFY_EMAIL: JSON.stringify(process.env.AWS_VERIFY_EMAIL),
  AWS_SIGNIN_GOOGLE_V2: JSON.stringify(process.env.AWS_SIGNIN_GOOGLE_V2),
  AWS_SIGNATURE_EVENT: JSON.stringify(process.env.AWS_SIGNATURE_EVENT),
  AWS_PUBLIC_KEY: JSON.stringify(process.env.AWS_PUBLIC_KEY),
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
  ICRC1_REGISTRY_CANISTER_ID: JSON.stringify(
    process.env.ICRC1_REGISTRY_CANISTER_ID,
  ),
  ICRC1_ORACLE_CANISTER_ID: JSON.stringify(
    process.env.ICRC1_ORACLE_CANISTER_ID,
  ),
  DELEGATION_FACTORY: JSON.stringify(process.env.DELEGATION_FACTORY),
  PASSKEY_STORAGE: JSON.stringify(process.env.PASSKEY_STORAGE),
  LEDGER_CANISTER_ID: JSON.stringify(process.env.LEDGER_CANISTER_ID),
  CYCLES_MINTER_CANISTER_ID: JSON.stringify(
    process.env.CYCLES_MINTER_CANISTER_ID,
  ),
  VAULT_CANISTER_ID: JSON.stringify(process.env.VAULT_CANISTER_ID),
  II_PROVIDER: JSON.stringify(process.env.II_PROVIDER),
  ECDSA_SIGNER_CANISTER_ID: JSON.stringify(
    process.env.ECDSA_SIGNER_CANISTER_ID,
  ),
  CANISTER_WITH_AT_LEAST_ONE_PASSKEY: JSON.stringify(
    process.env.CANISTER_WITH_AT_LEAST_ONE_PASSKEY,
  ),
  SWAP_TRS_STORAGE: JSON.stringify(process.env.SWAP_TRS_STORAGE),
  NFID_WALLET_CANISTER: JSON.stringify(process.env.NFID_WALLET_CANISTER),
  IC_SIGNER_CANISTER_ID: JSON.stringify(process.env.IC_SIGNER_CANISTER_ID),
  PATRON_CANISTER_ID: JSON.stringify(process.env.PATRON_CANISTER_ID),
  CHAIN_FUSION_SIGNER_CANISTER_ID: JSON.stringify(process.env.CHAIN_FUSION_SIGNER_CANISTER_ID),
  CHAIN_NETWORK: JSON.stringify(process.env.CHAIN_NETWORK),
  AWS_ECDSA_SIGN: JSON.stringify(process.env.AWS_ECDSA_SIGN),
  AWS_PASSKEY: JSON.stringify(process.env.AWS_PASSKEY),
  AWS_ECDSA_REGISTER: JSON.stringify(process.env.AWS_ECDSA_REGISTER),
  AWS_ECDSA_REGISTER_ADDRESS: JSON.stringify(
    process.env.AWS_ECDSA_REGISTER_ADDRESS,
  ),
  AWS_ECDSA_GET_ANONYMOUS: JSON.stringify(process.env.AWS_ECDSA_GET_ANONYMOUS),
  AWS_EXECUTE_CANDID: JSON.stringify(process.env.AWS_EXECUTE_CANDID),
}
