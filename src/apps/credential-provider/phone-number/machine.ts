// State machine controlling the phone number credential flow.
import { Principal } from "@dfinity/principal"
import { assign, createMachine } from "xstate"

import { fetchPrincipal } from "frontend/comm/actors"
import { fetchAccount, verifyToken } from "frontend/comm/im"
import { verifyPhoneNumber } from "frontend/comm/lambda"

// State local to the machine.
interface Context {
  phone?: string
  principal?: Principal
  credential?: string
  smsToken?: string
  error?: string | undefined
}

// Definition of events usable in the machine.
type Events =
  | { type: "LOGIN_COMPLETE" }
  | { type: "HAS_PHONE_NUMBER"; data: string }
  | { type: "INGEST_PRINCIPAL"; data: Principal }
  | { type: "ENTER_PHONE_NUMBER"; data: string }
  | { type: "INGEST_CREDENTIAL"; data: string }
  | { type: "ENTER_SMS_TOKEN"; data: string }
  | { type: "VERIFIED" }
  | { type: "CHANGE_PHONE_NUMBER" }
  | { type: "HAS_NO_PHONE_NUMBER" }
  | { type: "RESEND" }

// Definition of services used by the machine.
type Services = {
  fetchPrincipal: { data: Principal }
  fetchPhoneNumber: { data: string }
  verifyPhoneNumber: { data: boolean }
  verifySMSToken: { data: boolean }
}

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoBBPLVQ0GAY0a0wAVVh8AMuij1MAYnkB5AOIBJHAH1yGgLLJ5AUQAq5xKAAO6WPQZZbIAB6IATAAYfvAE4ggIB2AEYfADYAFi8AVi9QgBoQAE9vMLDeaJ8AZjCADkiCnzifIpCAX0qUtCxcQhIKKh46JlZ2Lh5SASERNokpWT4dTBhYWjYVMXo7FlUIet4VDnQAazBeOux8YjJKajaWNk5uPkFhUXpBmTke0fHJ0mnZlgQV9EH6LABtHwBdNwOJwuTBuTwIEK5XhhEIFTIBeFFXJQyIpdIIWJxXgFAq5XKRBIJApxMIBaq1DA7Rr7FpXY6dM49LRgSZUhp7Zms8zuegTFRQbYcpoLJYfDZbdm7JoHVoMBmnbq8Fls+rSvgqnl8hhjIXq0jvTCrL6-AFAxzOb5gpAeRCE6LZaKEmIBaIBSIe6Lou25Ly8SK+fGRAJxcLhaIUkB6mnNQ7yjqKjWs6Oc5Xc3n83VSmOqMjsHp2ZiSABm6FIBElapjsvpCa6SdV1NTmozOsF2c5huNkitf0BNuBltcNohXjCftyPmiISCcQKIbhuQK3shxV4k4CBKnZTiATCkUjKZldKOdaZacbwr45joZCPZFU5hw1gASvpkAAJDQ4cz6HDSYwACFzBfc0QStcFEFyUl13iMkwmiacimiOIvTSRAAh8LIvHyD1fRQt0IxqKMO2PON2hOesuUvfVeBvKRSAAZWMRjLHWGhVHID9+BwLRf0-b9f3-ICQLAodrVACEChCXhwnKXdIhCVFcliFcAl8WScIKaJtLKTdXUPUjaXIhUqIve8enoshmNY9i1CfV99Bs-RLA0ABpJ8xNBSCEGg6Eik3Lx4UKTIEJCFcEQKXg5xQ0MiShQyq05GtT0o88VQs3gADUWG4SQwBstiNjURZsGWI12MrJsyLlCjGSVDKjJ6HLmDyqRCrsrtPh7U1+3sC1vJHO01wiMcAxyVCPQilS-SiEJogQxSSg9ApEuq4zatM9Lkya7LcogfKOuK3NSHzXhCxLMsKwslL4zShqdqSpo9tag72pYoqaC6k1MD7LyIKGhAIgdOFEOgvJYnHBIIrJKKYtJKE5LHVbiJuk87vqvgP0YTAIGYMBbvaXgXzgdBmA4An0faVQ9D41jDBfcwABEHJ0fh5H+4dJLtEI-V3aJfSncIQzRdCgbyGSfERdTEKdaDx2qYjMHQHh4BtNGTLPJULn6cR8uGHpFGUCSQEHQbuYQOJoV8XwZ0JMJ+d5ldfAded1MwnxfChtar1jTatfOPorhuA3eAeOAnheOZmE5k2IStnEvC8QlpLdYIA2d7TooJUNyiRRSCR9-VCa27Wg4GfW7ljnzEl4G2fDt0lHZw6askw7SoibucEtRpqS4D6jMpbbUBQs6vAfgx0rfdYoQhT8KxYDfxMhCcpCkReJfSL6sqdLhtMqs0gx4HAaAYtsdsXyOdSVieaygXjF4T9BapYSENkQd7fkt3gfzN2w+jo0HHhbMk-hFLhACvCKc+4H6IFGg6SI0EPTFCKL4A8vcnobVrPdfeu0WptQKh9OywDbQIF8NiCIo1MgoThISOIrd-ANzJFCUMEQVJfxqtgzGg8mokIhIg2SEQSTuiUgSFS+4VyoRkuOSIsJmGxCXERSkmC-ZcMTD0bGuN8b92JqTcmlNNZ8OGtiPwM8xxsJ0vQsW7p-AqTKItMcc8pwcKwalbhvBNF4wMf7LYVA5B0H7kYhAHpsTaRDHYvCsjcgwxQrJJcKctwwKUSRFR-ccEaJxl4wJJ9wJc1ITELIpiPTmIhiSFceJIjrjkqGJEYRJxeBcaotx6ignYnro3B2rpebxEkVFPcIRJq7j8CpGcitKhAA */
const machine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: { events: {} as Events, services: {} as Services },
    id: "PhoneNumberCredentialProvider",
    initial: "AuthenticateUser",
    states: {
      AuthenticateUser: {
        initial: "Login",
        states: {
          Login: {
            on: {
              LOGIN_COMPLETE: {
                target: "IngestPrincipal",
              },
            },
          },
          IngestPrincipal: {
            invoke: {
              src: "fetchPrincipal",
              onDone: [
                {
                  actions: "ingestPrincipal",
                  target: "#PhoneNumberCredentialProvider.GetPhoneNumber",
                },
              ],
            },
          },
        },
      },
      GetPhoneNumber: {
        initial: "GetExistingPhoneNumber",
        states: {
          GetExistingPhoneNumber: {
            invoke: {
              src: "fetchPhoneNumber",
              onDone: [
                {
                  actions: "ingestPhoneNumber",
                  target: "#PhoneNumberCredentialProvider.HandleCredential",
                },
              ],
              onError: [
                {
                  target: "EnterPhoneNumber",
                },
              ],
            },
          },
          EnterPhoneNumber: {
            on: {
              ENTER_PHONE_NUMBER: {
                actions: "ingestPhoneNumber",
                target: "EnterSMSToken",
              },
            },
          },
          EnterSMSToken: {
            exit: "clearError",
            invoke: {
              src: "verifyPhoneNumber",
            },
            on: {
              CHANGE_PHONE_NUMBER: {
                target: "EnterPhoneNumber",
              },
              ENTER_SMS_TOKEN: {
                actions: "ingestSMSToken",
                target: "ValidateSMSToken",
              },
            },
          },
          ValidateSMSToken: {
            invoke: {
              src: "verifySMSToken",
              onDone: [
                {
                  target: "#PhoneNumberCredentialProvider.HandleCredential",
                },
              ],
              onError: [
                {
                  actions: "ingestError",
                  target: "EnterSMSToken",
                },
              ],
            },
          },
        },
      },
      HandleCredential: {
        invoke: {
          src: "resolveCredential",
        },
        initial: "ResolveCredential",
        states: {
          ResolveCredential: {
            on: {
              INGEST_CREDENTIAL: {
                actions: "ingestCredential",
                target: "PresentCredential",
              },
            },
          },
          PresentCredential: {},
        },
      },
    },
  },
  {
    actions: {
      ingestPhoneNumber: assign((_, { data }) => ({ phone: data })),
      ingestPrincipal: assign((_, { data }) => ({ principal: data })),
      ingestCredential: assign((_, { data }) => ({ credential: data })),
      ingestSMSToken: assign((_, { data }) => ({ smsToken: data })),
      ingestError: assign((_, { data }) => ({
        error: (data as Error).message,
      })),
      clearError: assign((context) => ({ ...context, error: undefined })),
    },
    services: {
      fetchPrincipal,
      async fetchPhoneNumber() {
        const account = await fetchAccount()
        if (!account.phoneNumber) {
          throw new Error("User has no phone number.")
        }
        return account.phoneNumber
      },
      async verifyPhoneNumber(context) {
        if (!context.phone) throw new Error("Missing phone number")
        if (!context.principal) throw new Error("Missing principal")
        const res = await verifyPhoneNumber(context.phone, context.principal)
        if (!res) throw new Error("Failed to verify phone number")
        return true
      },
      async verifySMSToken(context) {
        if (!context.smsToken)
          throw new Error("Please input your complete SMS token.")
        try {
          await verifyToken(context.smsToken)
          return true
        } catch (e) {
          console.error("SMS verification failure details", e)
          throw new Error("SMS verification failed, please try again.")
        }
      },
      resolveCredential: () => async (callback) => {
        // TODO
        callback({
          type: "INGEST_CREDENTIAL",
          data: "TODO",
        })
      },
    },
  },
)

export default machine
