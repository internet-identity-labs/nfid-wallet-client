// State machine controlling the phone number credential flow.
import {
  CredentialResult,
  registerPhoneNumberCredentialHandler,
} from "@nfid/credentials"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { fetchProfile } from "frontend/integration/identity-manager"
import {
  verifyPhoneNumberService,
  verifySmsService,
} from "frontend/integration/identity-manager/services"
import { verifyPhoneNumber as _verifyPhoneNumber } from "frontend/integration/lambda/phone"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine, {
  AuthenticationMachineContext,
} from "frontend/state/machines/authentication/authentication"

// State local to the machine.
interface Context {
  phone?: string
  encryptedPN?: string
  appMeta: AuthorizingAppMeta
}

let credentialResult: CredentialResult

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthenticationMachineContext
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
  | { type: "ENTER_PHONE_NUMBER"; data: string }
  | { type: "ENTER_SMS_TOKEN"; data: string }
  | { type: "CHANGE_PHONE_NUMBER" }
  | { type: "RESEND"; data: string }

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
        entry: () => {
          registerPhoneNumberCredentialHandler(function () {
            return new Promise((resolve) => {
              setInterval(
                () => credentialResult && resolve(credentialResult),
                1000,
              )
            })
          })
        },
        always: "Authenticate",
      },
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: "GetPhoneNumber",
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
        onDone: {
          target: "PresentCredential",
        },
      },
      PresentCredential: {
        entry: "presentCredential",
        type: "final",
      },
    },
  },
  {
    actions: {
      assignPhoneNumber: assign((_, { data }) => ({ phone: data })),
      assignEncryptedPN: assign((_, event) => ({ encryptedPN: event.data })),
      presentCredential: (context) => {
        if (!context.encryptedPN) throw new Error("Missing credential")
        credentialResult = {
          credential: context.encryptedPN,
          result: true,
        }
      },
    },
    services: {
      async fetchPhoneNumber() {
        const account = await fetchProfile()
        return account.phoneNumber
      },
      verifyPhoneNumberService,
      verifySmsService,
      AuthenticationMachine,
    },
    guards: {
      defined(_, { data }: { data: unknown | undefined }) {
        return data !== undefined
      },
      bool(_, { data }: { data: boolean }) {
        return data
      },
    },
  },
)

export default PhoneCredentialMachine

export type PhoneCredentialActor = ActorRefFrom<typeof PhoneCredentialMachine>
export type PhoneCredentialType = typeof PhoneCredentialMachine
