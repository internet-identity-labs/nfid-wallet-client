import { Ed25519KeyIdentity, DelegationChain } from "@dfinity/identity"

import users from "apps/nfid-frontend-e2e/src/helpers/users.json"

import { IC_DERIVATION_PATH } from "../internet-identity"
import { fromMnemonicWithoutValidation } from "../internet-identity/crypto/ed25519"
import { parseUserNumber } from "../internet-identity/userNumber"

const ONE_SECOND_IN_M_SEC = 1000
const ONE_MINUTE_IN_M_SEC = 60 * ONE_SECOND_IN_M_SEC
const TEN_MINUTES_IN_M_SEC = 10 * ONE_MINUTE_IN_M_SEC

// Helper to update all e2e users with new delegation
// Probably will be used if we updated the access list with new canister targets
// 0. Copy content from apps/nfid-frontend-e2e/src/helpers/users.json to ./users.json
// 1. Add useEffect(() => { updateAllE2EUsersAuthState() }, []) in any visible component, for example apps/nfid-frontend/src/features/security/index.tsx
// 2. Open app and login with any user, even your google account
// 3. You'll have a new users array in console
// 4. Copy its content to apps/nfid-frontend-e2e/src/helpers/users.json
// 5. Revert first step
export const updateAllE2EUsersAuthState = async () => {
  const newUsers = await Promise.all(
    users.map(async (user) => {
      const recoveryPhrase = user.seed.replace(/\s+/g, " ").trim()
      const stringUserNumber = recoveryPhrase.split(" ")[0]
      const userNumber = parseUserNumber(stringUserNumber)
      const seedPhrase = recoveryPhrase.split(`${userNumber} `)[1]

      const identity = await fromMnemonicWithoutValidation(
        seedPhrase,
        IC_DERIVATION_PATH,
      )

      const sessionKey = Ed25519KeyIdentity.generate()

      const chain = await DelegationChain.create(
        identity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + TEN_MINUTES_IN_M_SEC * 21600),
      )

      return {
        ...user,
        authstate: {
          delegation: chain.toJSON(),
          identity: sessionKey.toJSON(),
        },
      }
    }),
  )

  console.log({ newUsers })
}
