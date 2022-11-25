// State machine controlling the phone number credential flow.
import { ActorRefFrom, assign, createMachine } from "xstate"

import {
  registerPhoneNumberCredentialHandler,
  CredentialResult,
} from "@nfid/credentials"
import { clearProfile } from "@nfid/integration"

import {
  fetchProfile,
  removeAccount,
} from "frontend/integration/identity-manager"
import { verifySmsService } from "frontend/integration/identity-manager/services"
import { verifyPhoneNumberService } from "frontend/integration/lambda/phone/services"
import { Certificate } from "frontend/integration/verifier"
import { generateCredential } from "frontend/integration/verifier/services"
import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"

import { bool, defined, isDev } from "../common"

// State local to the machine.
interface Context {
  appMeta?: AuthorizingAppMeta
  phone?: string
  encryptedPN?: string
  authSession?: AuthSession
  token?: number[]
}

let credentialResult: CredentialResult
let credentialResolved = false

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthSession
    }
  | {
      type: "done.invoke.fetchPhoneNumber"
      data: string | undefined
    }
  | {
      type: "done.invoke.verifySmsService"
      data: boolean
    }
  | {
      type: "error.platform.verifySmsService"
      data: { error: string }
    }
  | {
      type: "done.invoke.verifyPhoneNumberService"
      data: string
    }
  | {
      type: "error.platform.verifyPhoneNumberService"
      data: { error: string }
    }
  | {
      type: "error.platform.generateCredential"
    }
  | {
      type: "done.invoke.generateCredential"
      data: Certificate | undefined
    }
  | { type: "done.invoke.registerCredentialHandler"; data: number[] }
  | { type: "ENTER_PHONE_NUMBER"; data: string }
  | { type: "ENTER_SMS_TOKEN"; data: string }
  | { type: "CHANGE_PHONE_NUMBER" }
  | { type: "RESEND"; data: string }
  | { type: "CLEAR_DATA" }
  | { type: "CONSENT" }
  | { type: "REJECT" }
  | { type: "END" }

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoAlMIwgBPAMSJQAB3Sx6DLJJAAPRAEYAHGt4AWNQHYtAViMAGHRv2mATABoQI9UYCcO3mYDMpo-o-PNvjoAvkH2aFi4hCQUVDx0TKzsXDykvACCeLSoNAwAxoy0YGIQEbz0mBzoANZg6ZnZ8fkKmACyjLmo5WBKMnLNSqoIHgBs1rymw0Y6HnrOGhoeGs72jggGBrwapmomaqb6JjrbIWEY2PjEZJTU8SxsnNx8AOJgtOHnUc+vAKLK9LAMTBQd6RS6kYqlcqVGq8ABmrw6IIu0R6snk9EUSBUiD0Gl4gQ8Oxcw1Gww8RhWiGspg0Yw0OmsHl8RnJTI0wxOICRnxiNwYdySj1SLzeZ1B0V43zoZG5YLE3xwABVvvwAPrIAASAHkcN9VTgAKotABCKtRfQxmAGOI8Hk2fn0zn01mcpgmrkpCGsemGvGGmnpajUzhdk05sui1zi-MSDxSvBFEb4ADUyPRYSIk+CStgyhVqrUOGmM1mAMpkLi5bpY3rozGgQZ+ZzuJ3DN1LbY+fSe6zMzZGSwWdlePwc0JcsXIq6xHIJe7JL6iiJT1Kp0jpzOTnliMjsVJSZgFWHoUgEXhF9clrdg8ukSvV6Ro-pYwZqHRuPx6czDWnmObDHsLDtd9TGcIx-QOPYNHDa9IxnW5YwXYVXizSVpVIUsWlLRUC0wMRyA1NIcCePVNR1PVDRNM0ayfS1rTWbRnC8XtJkdNRqSDDQe2GfR9D9SxrB8Ix2JDXwYOXHko1nAU40XVCpUKDCsJwmo8IVZU1Uw0tVUVLUAGkFXNOsrRfHFhM2fQ9m2HjaQHZYHCpZwf10LRTBHIxvV7aDxyzKSEPnIUExQ2C+AUsgtJUmgxH4b5SwVAARIznwbKkpnxBl-F8QTvQmLiHK9fQdCMdwNDMXw1CZYkPHEj4wT8mMAvjRMQtXFhuAKMAItwiFcyhAtz2LERSwIWBb3vJK6NMhB6VMdwZi2LZhlcFkdB7fRRk2Ax5msLR2SDIwavFac+TnQUmuCiSwV4ZM2ogDqutUndSD3XgDyPE8zwvDdhtGit6CrCb62xL1rG0eYbDA70RjfHQAPyl1ePxQlvBcZ0eLmQ6V3q07ZOQpdauiHragBDreF8+CGrOuSWsBkyUoQOZtEmW09jbRYys9AxGV4W0HSc6xBJMA7OUwdAeHgLFyZOmSkIEIRRFp+iAFo9nGVndtAgcXRmTnwLtN0vAZLRYcdaxMckimcdljIslnJoHxAWtkuBrxZrbPWyRMb93118yDZR3saUEsdTkuuDpcQwLmrDxdfn+QFgRpmiLSBxtYd4ZbA6WSYnPs1Zg00XgBZMKwQymNyQ4nGPeWjK2o4ugnQvQrNFam99m0seY7Nmck8tWRlrF9H8jltFx2eqnyWuxmX6-xo7V0Glvk+M+iZl9TOrGz1HzB7cDfTUEkmPmZwnKWc26stmfzrnlc0MUh6aFb+nYbcL2luDKZ2Rsbt4csO0BaWK6L8zonTn3DrXK+1Nq7XVuvdZSuEn4ux0M2f0Hhg7bF4vtVa+UvBLTmhMaky0eLrTAcdCBkdr7yUwBARBr5QL7y3gyEw3oGQ9gqs2cCbkQy2mdDoMSk9q7TwoVAxupBaGIBVmMd0zoZjUksHMWknN6S+mLuBEMewPLC1DqIoRjU+BsDgDkIR4iGbeAzoPXibpvBHF7LrDang3KCxGHMYIAidGX2EWI5eztBhKxGOMJaMiGQ0kdPMTmfDmz+y0NSN0jJXEhCAA */
const PhoneCredentialMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./phone-credential.typegen").Typegen0,
    schema: { events: {} as Events },
    id: "PhoneNumberCredentialProvider",
    initial: "Ready",
    states: {
      Ready: {
        invoke: {
          src: "registerCredentialHandler",
          id: "registerCredentialHandler",
          onDone: {
            target: "Authenticate",
            actions: "assignCredentialRequest",
          },
        },
      },
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: [
            {
              cond: "isDev",
              target: "DevClearData",
              actions: "assignAuthSession",
            },
            { target: "GetPhoneNumber", actions: "assignAuthSession" },
          ],
          data: (context) => ({
            appMeta: context.appMeta,
          }),
        },
      },
      DevClearData: {
        onDone: "GetPhoneNumber",
        initial: "Start",
        states: {
          Start: {
            on: {
              CLEAR_DATA: "Clear",
              END: "End",
            },
          },
          Clear: {
            invoke: {
              src: "clearAccountData",
              id: "clearAccountData",
              onDone: "End",
            },
          },
          End: { type: "final" },
        },
      },
      GetPhoneNumber: {
        initial: "GetExistingPhoneNumber",
        states: {
          GetExistingPhoneNumber: {
            invoke: {
              src: "fetchPhoneNumber",
              id: "fetchPhoneNumber",
              onDone: [
                {
                  actions: "assignEncryptedPN",
                  cond: "defined",
                  target: "End",
                },
                { target: "EnterPhoneNumber" },
              ],
            },
          },
          EnterPhoneNumber: {
            on: {
              ENTER_PHONE_NUMBER: {
                actions: "assignPhoneNumber",
                target: "VerifyPhoneNumber",
              },
            },
          },
          VerifyPhoneNumber: {
            invoke: {
              src: "verifyPhoneNumberService",
              id: "verifyPhoneNumberService",
              onError: "EnterPhoneNumber",
              onDone: {
                target: "EnterSMSToken",
                actions: "assignEncryptedPN",
              },
            },
          },
          EnterSMSToken: {
            on: {
              CHANGE_PHONE_NUMBER: "EnterPhoneNumber",
              ENTER_SMS_TOKEN: "ValidateSMSToken",
              RESEND: "VerifyPhoneNumber",
            },
          },
          ValidateSMSToken: {
            invoke: {
              src: "verifySmsService",
              id: "verifySmsService",
              onDone: [
                {
                  cond: "bool",
                  target: "End",
                },
                { target: "EnterSMSToken" },
              ],
              onError: "EnterSMSToken",
            },
          },
          End: {
            type: "final",
          },
        },
        onDone: "Consent",
      },
      Consent: {
        on: {
          CONSENT: "GenerateCredential",
          REJECT: {
            target: "End",
            actions: "rejectCredential",
          },
        },
      },
      GenerateCredential: {
        invoke: {
          src: "generateCredential",
          id: "generateCredential",
          onDone: {
            actions: "presentCredential",
            target: "End",
          },
          onError: {
            target: "Consent",
          },
        },
      },
      End: {
        type: "final",
      },
    },
  },
  {
    actions: {
      assignAuthSession: assign((_, event) => ({
        authSession: event.data,
      })),
      assignCredentialRequest: assign({
        token: (_, event) => event.data,
      }),
      assignPhoneNumber: assign((_, { data }) => ({ phone: data })),
      assignEncryptedPN: assign((_, event) => ({ encryptedPN: event.data })),
      presentCredential: () => {
        credentialResult = {
          status: "SUCCESS",
        }
        credentialResolved = true
      },
      rejectCredential: () => {
        credentialResult = {
          status: "REJECTED",
          message: "User declined to provide credential",
        }
        credentialResolved = true
      },
    },
    services: {
      async fetchPhoneNumber() {
        const account = await fetchProfile()
        return account.phoneNumber
      },
      async clearAccountData() {
        await removeAccount()
        clearProfile()
      },
      async registerCredentialHandler() {
        const token = await registerPhoneNumberCredentialHandler(() => {
          return new Promise((resolve) => {
            setInterval(
              () => credentialResolved && resolve(credentialResult),
              1000,
            )
          })
        })
        console.debug(registerPhoneNumberCredentialHandler.name, { token })
        if (
          !Array.isArray(token) ||
          !!token.find((x) => typeof x !== "number")
        ) {
          console.error(token)
          throw new Error("Received an invalid token.")
        }
        return token
      },
      verifyPhoneNumberService,
      verifySmsService,
      AuthenticationMachine,
      generateCredential,
    },
    guards: {
      defined,
      bool,
      isDev,
    },
  },
)

export default PhoneCredentialMachine

export type PhoneCredentialActor = ActorRefFrom<typeof PhoneCredentialMachine>
export type PhoneCredentialType = typeof PhoneCredentialMachine
