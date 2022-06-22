import { atomWithMachine } from "jotai/xstate"
import { createMachine, InternalMachineOptions } from "xstate"

interface VerifyPhoneNumberMachineContext {}
interface VerifyPhoneNumberMachineServiceMap
  extends InternalMachineOptions<VerifyPhoneNumberMachineContext, any, any> {
  guards: {
    isRegisteredDevice: (context: any, event: any) => boolean
  }
}
interface VerifyPhoneNumberMachineProps {
  context?: VerifyPhoneNumberMachineContext
  serviceMap: VerifyPhoneNumberMachineServiceMap
}

export const VerifyPhoneNumberMachine = ({
  context = {},
  serviceMap,
}: VerifyPhoneNumberMachineProps) =>
  atomWithMachine(() =>
    /** @xstate-layout N4IgpgJg5mDOIC5QDcwCcCWAzAngWgAcALAewDsw8yBXAWwCN0A6ASTIjAA8BiRUAkrAwAXDOT4hOiAKwAGAJxNpARnkA2ACwB2OQvVaANCByI86xcukAOAEyyrG6WquyNVgL7ujqTLkKkKKjpGNCYAJTBaEmEwAEFqYSIwMlEAYwBDGKYAZTAAGzBU4XjEgFkwRJIIbij6DAKJASFRcSRJRCtLJnkAZmkNDR7ZWUsdIxMEPDV5GyYtNTVZHvlemx0Zz290bHxickoaBmYIqJiSpJSMDJjuWIBVABUACQBRADkHlgBhWIeXgBFGoIRGIyBIpAg1DolFoNGoej1ptI+rZxqZBspugstD1BrZrDo1JsQD4dv59kEjqFzsk0pkwLdHq8Pt9fgCgc1QeDED0bBomAjrNZOvIrPItPI0ZMFrImI4+jYbIjlI41MpiaS-HtAocQkwADIkdIQL5oSC0jDpPKwbhPWLZAD6XzCAPen1i+o5INaoAhPWUViUskVa2UUOkyJsaileD6aiYKqVdgl9glmg12y1AQOwWYhuNpvNlytNreAHknS7-m6WB6HQAxMt3N6AtpNb1gtoQlQ9ObKQU9MXaGximNxhMaJWD+ZqKMjjO+XbZyl6l4pdAABWzb1zaG4ADUPSx-g6N08y28Xg63ndSi8wl6Wp3fTIlUwoxowz15jYVQsY6omIODY0h8oqCiWK4C5ktqOZUkwa4xGgW77DuVLcCwbyHvqx6nuel7Xre96PlyXaIFoWiYoimgqNMEpWDiMZrL24qfsoCgaPIyLKOqXgkpmS4UrqzCIeg2SlNkDwkAA1skB5HieDxlgA0u8JE+u0CARvyyiwiO0yqLIWijsYiDsUwQ4jFYYpqP0izWJ4fFkFUcASJqgk6rurDsFw6nPppTjxkqAwOLCulGT0AGyJo3QzP0CKQXC0jQVmQleSc0RxAkFx0lkuQFEU5zlJUEB+dyWmDkoqiaFYuLwtIkqmdKKzvjKywqvIww8SlHlwXqGVnNlFrXGATAbiQeR5PWJBoP8+RgFA9JlWRCDzPysIaK4c7ioskVNVMI5yoOqw9ji-Y9eSnnwQNWWJMNS1tsCT7lSo-IqOobh1X0jUTHgFGzFG9l2J0wxWMlfHuZdfXMDSlwjctL4ILyspwgxKrGVodiuDGsKBoD0Vg1Ciy1RdsErnmRommaHDFtaCOaZ+spE-ZoFgwGNgxnicrYny8gqsiIyk8uwmhKJyHbru9Pdv2VXBm4gyKsoipMS4cphTxRn6ILEMCVD5Oi+uaDiZJMnJFLr5aN0iKyKBQwgf6VgAQGTA25RbjSBRzg4loQtpfBG5mrAtKFjTohWubCA2C1VhqrOYqnbV0hSvyyybSMXE6E4Ay8Vsi56yLEdrNIFmxyOXH9sZfRO9+sUgQMwz2Li8iOe4QA */
    createMachine(
      {
        context,
        id: "verify-phone-number",
        initial: "Index",
        states: {
          Index: {
            always: [
              {
                cond: "isRegisteredDevice",
                target: "Authenticate",
              },
              {
                target: "RemoteAuthenticate",
              },
            ],
          },
          RemoteAuthenticate: {
            initial: "SelectAuthMethod",
            states: {
              SelectAuthMethod: {
                on: {
                  mobile: {
                    target: "PollForDelegate",
                  },
                },
              },
              PollForDelegate: {},
            },
            on: {
              AUTHENTICATED: {
                target: "LoadCredentials",
              },
            },
          },
          Authenticate: {
            on: {
              AUTHENTICATED: {
                target: "LoadCredentials",
              },
            },
          },
          LoadCredentials: {
            on: {
              HAS_CREDENTIAL: {
                target: "PresentCredential",
              },
              NO_CREDENTIAL_FOUND: {
                target: "EnterPhoneNumber",
              },
            },
          },
          EnterPhoneNumber: {
            on: {
              VALID_PHONE_NUMER: {
                target: "EnterSMSToken",
              },
              INVALID_PHONE_NUMER: {
                target: "EnterPhoneNumber",
                internal: false,
              },
            },
          },
          EnterSMSToken: {
            on: {
              VALID_TOKEN: {
                target: "PresentCredential",
              },
            },
          },
          PresentCredential: {
            type: "final",
          },
        },
      },
      serviceMap,
    ),
  )
