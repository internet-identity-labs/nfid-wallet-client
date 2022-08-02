// State machine controlling the phone number credential flow.
import { DerEncodedPublicKey } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { assign, createMachine } from "xstate"

import {
  callWithIdentity,
  fetchPrincipal,
  rawId,
} from "frontend/integration/actors"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "frontend/integration/identity-manager/account/constants"
import { verifyPhoneNumber } from "frontend/integration/lambda/phone"
import { Certificate } from "frontend/integration/verifier"

// State local to the machine.
interface Context {
  phone?: string
  principal?: Principal
  credential?: Certificate
  smsToken?: string
  error?: string | undefined
  appDelegate?: DelegationIdentity
}

// Definition of events usable in the machine.
type Events =
  | { type: "LOGIN_COMPLETE" }
  | { type: "HAS_PHONE_NUMBER"; data: string }
  | { type: "INGEST_PRINCIPAL"; data: Principal }
  | { type: "ENTER_PHONE_NUMBER"; data: string }
  | { type: "INGEST_CREDENTIAL"; data: Certificate }
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
  resolveToken: { data: Certificate }
  fetchAppDelegate: { data: DelegationIdentity }
}

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoBBPLVQ0GAY0a0wAVVh8AMuij1MAYnkB5AOIBJHAH1yGgLLJ5AUQAq5xKAAO6WPQZZbIAB6IATAAYfvAE4ggIB2AEYfADYAFi8AVi9QgBoQAE9vMLDeaJ8AZjCADkiCnzifIpCAX0qUtCxcQhIKKh46JlZ2Lh5SASERNokpWT4dTBhYWjYVMXo7FlUIet4VDnQAazBeOux8YjJKajaWNk5uPkFhUXpBmTke0fHJ0mnZlgQV9EH6LABtHwBdNwOJwuTBuTwIEK5XhhEIFTIBeFFXJQyIpdIIWJxXgFAq5XKRBIJApxMIBaq1DA7Rr7FpXY6dM49LRgSZUhp7Zms8zuegTFRQbYcpoLJYfDZbdm7JoHVoMBmnbq8Fls+rSvgqnl8hhjIXq0jvTCrL6-AFAxzOb5gpAeRAhe28XJeEJlHxhLzFVHoxCRQqOiK5EoBaKwsLRSIUkB6mnNQ7yjqKjWs6Oc5Xc3n83VSmOqMjsHp2ZiSABm6FIBElapjsvpCa6SdV1NTmozOsF2c5huNkitf0BNuBltcNohhWivB8Hty5UJ0QKUPn3sh+N4IWKcRJkRRga8XkjKZldKOdaZacbwr45joZAPZFU5hw1gASvpkAAJDQ4cz6HDSYwAIXMJ9zRBK1wUQJ1oVKApojnEIvGiFFfDRNJEFxEIJyRIofGiOE4g3fcO0PON2hOesuXPfVeCvKRSAAZWMOjLHWGhVHIN9+BwLRv3fT9v1-ACgJAodrVACE4gCbJYMySIAjiQMQh8AJciXAIol4OIQhycJ4nxN09xqKMiNpEiFXIs9bx6GiyAYpiWLUB9n30Wz9EsDQAGkH2E0FwIQJ1sUiScN3k4NfQCJdMhg7JclwkonSDMII0Myya2PMjTxVSzeAANRYbhJDAWzmI2NRFmwZYjRYysm2IuVSMZJVMuMnpcuYfKpCK+yu0+HtTX7ewLR8kc7TUwI8XgwkwyhRIIqdDC1wSXS1K8MJA0IqtOVS+N0sa5NmpyvKIAKzqStzUh814QsSzLCsUqPbaGobLLWvawrGOKmhupNTA+28sDhshSINNhWSvHyHx4L8aIIrHaLcJyWF8TxOJ1pqky6rM0830YTAIGYMAtvaXgnzgdBmA4An7qJknaGeMAKYAETAfGoAK0VyvFTY7tMk8lWx3H8cJlhidJ8nKZ5kXafoemwCZlmCq+3qfrNAdBv+sTEACBCJ13KE4ThAplOh1CEGUgpAlgkIgiiGD8iSykNtq2sdr4fm8fFjHmBF2AyYpoWvZJn2xY+0qxUqiVuc9l2ejdwWqeFwPfY92tvaTkPFdBX7VdA4cNYQSI11XQlyhWiGElyOIIpwjC5whnCVpij0ksMzB0B4eAbUj53Hp6C5+nEArhh6RRlFEkBByGvP5N4XxfCtyaJNwrwl18cdDa1tTJ30lHkua-3o96S4BkHu5eAeOAnheOZmD+3PbQQaeCl3Ql52iYIAkiZeTa8KL5MJRTcSFALgSVGF5YxRx7offu1wT5kFvmPCEiQZ5b3nqSRe8EVIm1WlkdeiRQz4XDKA-U+9IFNUdg2LUmZ2zkNIPA3yiVoSwiKCFGIiVP5fwxIFbEH8oTVz8L6HeDs0bgO7omCiWVrKkEsnQgGhQMI4QCBEeceQ5JPyXFbc2HpMgujXEpZSuQiHVnjrzJ6+1JEnRoDIvOiUvDZAiLBLELo34cMQBECI2QSS4g-riOIBdyS7xoSQsRFl9ovSOh1d69krH3xBjiRucJYi7mDFECKiRuG7jJFuKEuRVGGM2sYg+ZDhHRIhBXKSIZEpyQUkpTBGJ5K2J4dOLcH88i+jyU7NKkDY7J2PKnMW-tJZ00ZszMArMpAlJ9Dk3ghIP4RHCP-LWqk-RwlCL6D0qJ5ztPRqI8y3SBmJ36cYvpFMQ4TNNruKSURERhFJAbWpri8jjkRFELSRQWkGSEWAoJuycbu32aLP2xizkCOmRJX0ENEqaUWSbGC2IVlrkSJ-eFWyRGdOCXso5bA4CiH9sCxCq4ohvz0TBPxMM4TZDSSSTIkK1wou+VjX5cceZnIklkGZ4L5lQpcZCeCq5DZrnDBuUuVQAnCPpd0FlyC54fzQcGeC8QlwbhxEEJuWs-CrSttUaoQA */
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
        initial: "ResolveCredential",
        states: {
          ResolveCredential: {
            initial: "RetrieveDelegate",
            states: {
              RetrieveDelegate: {
                invoke: {
                  src: "fetchAppDelegate",
                  onDone: [
                    {
                      actions: "ingestAppDelegate",
                      target: "ResolveToken",
                    },
                  ],
                },
              },
              ResolveToken: {
                invoke: {
                  src: "resolveToken",
                  onDone: [
                    {
                      actions: "ingestCredential",
                      target:
                        "#PhoneNumberCredentialProvider.HandleCredential.PresentCredential",
                    },
                  ],
                },
              },
            },
          },
          PresentCredential: {
            entry: "presentCredential",
            type: "final",
          },
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
      ingestAppDelegate: assign((_, { data }) => ({ appDelegate: data })),
      ingestError: assign((_, { data }) => ({
        error: (data as Error).message,
      })),
      clearError: assign((context) => ({ ...context, error: undefined })),
      presentCredential: () => {},
    },
    services: {
      fetchPrincipal,
      async fetchPhoneNumber() {
        // const account = await fetchAccount()
        // if (!account.phoneNumber) {
        //   throw new Error("User has no phone number.")
        // }
        // return account.phoneNumber
        throw new Error("Not implemented")
      },
      async verifyPhoneNumber(context) {
        if (!context.phone) throw new Error("Missing phone number")
        if (!context.principal) throw new Error("Missing principal")
        const res = await verifyPhoneNumber(context.phone, context.principal)
        if (!res) throw new Error("Failed to verify phone number")
        return true
      },
      async verifySMSToken(context) {
        // if (!context.smsToken)
        //   throw new Error("Please input your complete SMS token.")
        // try {
        //   await verifyToken(context.smsToken)
        //   return true
        // } catch (e) {
        //   console.error("SMS verification failure details", e)
        //   throw new Error("SMS verification failed, please try again.")
        // }
        // return true
        throw new Error("Not implemented")
      },
      async fetchAppDelegate() {
        // // TODO: How to get account data
        // const localAccount = JSON.parse(
        //   window.localStorage.getItem(ACCOUNT_LOCAL_STORAGE_KEY) || "{}",
        // )
        // return fetchDelegation(
        //   Number(localAccount.anchor),
        //   // TODO: How to get scope data
        //   { host: "test.com" },
        //   Array.from(
        //     new Uint8Array(
        //       rawId?.getPublicKey().toDer() as DerEncodedPublicKey,
        //     ),
        //   ),
        // )
        throw new Error("Not implemented")
      },
      async resolveToken(context) {
        // if (!context.appDelegate) throw new Error("No app delegate")
        // const blob = await callWithIdentity(async () => {
        //   if (!context.phone) throw new Error("No phone number")
        //   return await generatePNToken(context.phone)
        // }, context.appDelegate)
        // console.log("generated phone token", blob)
        // const token = await resolveToken(blob)
        // if (!token) throw new Error("Failed to resolve token")
        // return token
        throw new Error("Not implemented")
      },
    },
  },
)

export default machine
