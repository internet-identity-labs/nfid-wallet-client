import { atomWithMachine } from "jotai/xstate"
import { createMachine } from "xstate"

export const VerifyPhoneNumberMachine = ({ context = {} }) =>
  atomWithMachine(() =>
    createMachine({
      context: context,
      id: "verify-phone-number",
      initial: "AuthenticateUser",
      states: {
        AuthenticateUser: {
          on: {
            AUTHENTICATED: {
              target: "GetExistingCredential",
            },
          },
        },
        GetExistingCredential: {
          entry: ["fetchAccount", "fetchDelegate"],
          on: {
            HAS_CREDENTIAL: {
              target: "PresentCredential",
            },
            HAS_NO_CREDENTIAL: {
              target: "VerifyPhoneNumber",
            },
          },
        },
        VerifyPhoneNumber: {
          on: {
            VERIFIED: {
              target: "PresentCredential",
            },
          },
        },
        PresentCredential: {},
      },
    }),
  )
