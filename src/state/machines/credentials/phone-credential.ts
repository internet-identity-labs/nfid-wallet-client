// State machine controlling the phone number credential flow.
import { DerEncodedPublicKey } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { ActorRefFrom, assign, createMachine } from "xstate"

import {
  callWithIdentity,
  fetchPrincipal,
  rawId,
} from "frontend/integration/actors"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "frontend/integration/identity-manager/account/constants"
import { verifyPhoneNumber } from "frontend/integration/lambda/phone"
import { Certificate } from "frontend/integration/verifier"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine, {
  Context as AuthenticationMachineContext,
} from "frontend/state/machines/authentication/authentication"

// State local to the machine.
interface Context {
  phone?: string
  principal?: Principal
  credential?: Certificate
  smsToken?: string
  error?: string | undefined
  appDelegate?: DelegationIdentity
  appMeta: AuthorizingAppMeta
  authSession?: AuthSession
}

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthenticationMachineContext
    }
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
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoBBPLVQ0GAY0a0wAYghYwvepg7oA1gsHDR9CVICyjMaiVhEoAA7pY9BljMgAHogCMAdgAcvAJyuvAFgAGZ3cAjy8vZwAaEABPRD8ANgBmXiTnBL93ZySvAFZ3POcAXyLotHl8YjJKajomVnYuHlJeAHEwWnLsSpIW9toAUQd6WAZMKC7cQl7ZeUVlNQVJnuqqHjqWNk5uPn7l6d2OoZGxiYxug9IEJRVdeiwAbQCAXXtLa1tMeycEVz-UgBMrlyASCAIS7lcSQS0TiCASwVSzgCSRC-jczkSJTK5ymVQoa20m0aOz6HX2+LaR2GoyUZwql2kZHYLXMzEkADN0KQCLwKb0ausGMTts0qZ1cSsyYMaad+WRrgs7o8Xm8rDZ7l8kI4XO4-LwAuCkgF3AlcpkoZDYYgoSlXBD8rlkpaAQDsSB5QTasKGqLDhKGZSBnQyJ7pAMcAAVAYAJQA+sgABIAeRwAzjOAAqnoAEKxtUfTXfRBJAEpAL5PwWgF+JKuAEBGGxRDuSEGrKthIBPweXL5d2ewVE31Nf2e3jBqSkADKemnkcWmGk5ET-BwrXTSdT6azufz2veGrs2p+uS8vCrfmc6TyqNcAS8SWtCC8jd4uVcgVczgBuSSxp-AdJUuIcNhHUlxXHScyFnedF3DKNYzjWC40jZMAGkIwLI8tVAH5S1yXgu1-dw-38BEvGfa89QvJIexCUs0XSIDAwFQkwK2UdpXHAA1FhuEkMBYIXdQlzkbB5hUdQ+WA-FQJ9TiIL2WTel4PjmAEqRhMXRVbkkTUnleA91U+Ytflfbx3DrcFckxKEAUo5sEGyIFeHtXJXTIw1sncFiLjk9iFJJMVlNYvh1M0oS5xEmgmVIFleDZTluV5QdAvqRSQvJFTwv4iBBO00TdPQZVMEM7DTJPG0EnfNwEi8MtkXrUE-Co4J9VrHtAjcf8rNyPy8TY70MuCvhE0YTAIGYMB5PqXgYzgdBmA4Gb0pYeaOlIegwBWgARMBpqgQTZgkm5FhksKvSFEa-RacbJum2b1oW2AlpWp7mA22gtp2sB9sOwTitK8rjMLY88MQBr9UNIE60hVtH1apzH08fwe3CRs9TSBIBqlD7MrGiaptW4bnsW5aSeusnXopmKxLmM7pLS0nwLFe7iY+jaafetbPpet6wDpoH9JVIyLBMosqvhe03LNE0ASajyklyKju1cC8QnvPwFbo8EcfdTB0B4eBtWZqnWb4TQRDqXRTFBnCzORAFeEhNIARCdxXUNb9n2Nc9UWve8-ysgp9ZxS78dG7iculY5aXGT0KsliHnOSXg3FNMiMnSBJXWfLtCK8BIoTV0EEX60oPRjyPbsgmOJxDUhE-tyqU+CdXuwiE17xyfIAWfXxPHBQOPy7cJ-1xkDeYJ6PLobqdCpoJPwZ1VPnavbsq1-YE-Aa1XkQ1-JQ9bJ1fEngKWZnuu54i-KtOixdl9w1e6pd3WPG111-EbKiHML11nBFzrP+PIvlK5m2HFfUK-lehPzMsrC8VZrz1WDveR8z4-zOx8MrNIJdGJunAdXaeUdeDs0erzLmAtOYLW+ttPaB0wBHSkHAqWyRzxmiLk1dIH497I0RGEe0P5i7QkhOfIa5sr5kMpsOShFNqHkxWnTFhKcGrr0CPVLItkPBWVVnRSyjZPymiLoaMRqxL4kKkfI7m0iwLKNXuXIiZ4EShG4b4fuTk9SEV8GeVsDl7xZC8KYq6kCLFE3ISzPkVBYCiA+nYn4GQ7SNl3g+Lwepi6OThIHTw2tQG2WQaPIJNcuKkLCTYn0cTEBnmcI4zhLizRuIHvWF2MNPEFFAQQ8OMCzESKjhU5y1TLzINvJCB8pZnxlhqnebWHlbQQhMSUIoQA */
const PhoneCredentialMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./phone-credential.typegen").Typegen0,
    schema: { events: {} as Events, services: {} as Services },
    id: "PhoneNumberCredentialProvider",
    initial: "Authenticate",
    states: {
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: {
            target: "GetPhoneNumber",
            actions: "assignAuthSession",
          },
          data: (context) => ({
            appMeta: context.appMeta,
          }),
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
                  actions: "assignPhoneNumber",
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
                actions: "assignPhoneNumber",
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
                actions: "assignSMSToken",
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
                  actions: "assignError",
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
                      actions: "assignAppDelegate",
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
                      actions: "assignCredential",
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
      assignAuthSession: assign({
        authSession: (_, { data }) => data.authSession,
      }),
      assignPhoneNumber: assign((_, { data }) => ({ phone: data })),
      assignCredential: assign((_, { data }) => ({ credential: data })),
      assignSMSToken: assign((_, { data }) => ({ smsToken: data })),
      assignAppDelegate: assign((_, { data }) => ({ appDelegate: data })),
      assignError: assign((_, { data }) => ({
        error: (data as Error).message,
      })),
      clearError: assign((context) => ({ ...context, error: undefined })),
      presentCredential: () => {},
    },
    services: {
      async fetchPhoneNumber() {
        // const account = await fetchAccount()
        // if (!account.phoneNumber) {
        //   throw new Error("User has no phone number.")
        // }
        // return account.phoneNumber
        throw new Error("Not implemented")
      },
      async verifyPhoneNumber(context) {
        const principal = context.authSession?.delegationIdentity.getPrincipal()
        if (!context.phone) throw new Error("Missing phone number")
        if (!principal) throw new Error("Missing principal")
        const res = await verifyPhoneNumber(context.phone, principal)
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
      AuthenticationMachine,
    },
  },
)

export default PhoneCredentialMachine

export type PhoneCredentialActor = ActorRefFrom<typeof PhoneCredentialMachine>
export type PhoneCredentialType = typeof PhoneCredentialMachine
