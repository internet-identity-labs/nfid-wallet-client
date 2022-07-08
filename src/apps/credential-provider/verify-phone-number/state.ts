import { atomWithMachine } from "jotai/xstate"
import { createMachine, InternalMachineOptions } from "xstate"

export interface VerifyPhoneNumberMachineContext {}
interface VerifyPhoneNumberMachineServiceMap
  extends InternalMachineOptions<VerifyPhoneNumberMachineContext, any, any> {
  guards: {
    isRegisteredDevice: (context: any, event: any) => boolean
    hasCredential: (context: any, event: any) => boolean
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
    /** @xstate-layout N4IgpgJg5mDOIC5QDcwCcCWAzAngWgAcALAewDsw8yBXAWwCN0A6ASTIjAA8BiRUAkrAwAXDOT4hOiAKwAGAJxNpARnkA2ACwB2OQvVaANCByI86xcukAOAEyyrG6WquyNVgL7ujqTLkKkKKjpGNCYAJTBaEmEwAEFqYSIwMlEAYwBDGO5YgFUAFQAJAFEAOTyWAGFYvKKAEQkBIVFxJElEK1UmZQ1ZOQBmG3kbDRsOoxMEPB0+pldrBTU+6Xk+rT7Pb3RsfGJyShoGZnjE5LTMsGz84rLK6rqGwRExMgkpBD7ZNSY3GzVlVVkyi0Vi0lnGpmms0cLmh9mB6y8IB8238eyCh1CABkSOkIBU0JBThh0gAbWC8VqNJ4tUBvaQ2LRMAZWJag5RqNbA8GTNROJjOEHsoZaP5aDQbJFbPy7QIHEJMIopdAABQCYBKwXQ3AAarFMSxagB9ZUFADyJSKhpKOQAsgAhIphB5NZ6vRBaeTSJguP5LRb-WTDbl4DSaJh2eRaHQaeSWDTKCXI6Vq9HyxUxNAAZRtmbyJAA1skdXqDYa8qaANKlZ3Ul6tN4s5T8wZaOwqNyfGzc5Syb0raRaexWeQKDR9KweRFJnYpuXMdPobO5gtFioFWIlADilpN5st1vtjprzTrtMQ2kZLmUgzUc3ZA+DfQ5-M9HfsmhsNgTErIJA48FaadUVlTVQjYDg3n4R4TzdBAB17McOiGaRQzUND5GDHtrH5ZQ+mvRYVg+BxEylGc0TnUIIiiGJjiSFIMAyGJj1det3QnJgPX+QYxxjccMOMUxBX5KwVE-MV1BGSdNl8MiQIxJhaKJRiwGYmk2neQMcMjaw8KsP5rGDIYZg5bpdGceRhRImTgP2UCmGxXF8UJejSQAqCXTUuk+hmUZpHHDltMWLsBMmHRFBQvy0KjGxvOBKyURlWz5IXNBVT2DUMVU091I9Xt1A5elNG6UENGDaRlnDSw1DEz0-XkeLk3IuyUqXPNC2yqkYNYhAXC9PoR1kJZ+tFQwQrwVYNC6V9dAHSxvIa2SkvlZUCVgU4nI4FySSy2DBkUPT2VGT1cPhaRuUm-qekBT0dCcDR4wWmzU3QHbuoZL0Duq4cVFWFkzrG-48JwvCexWRY-OkTxPCAA */
    createMachine(
      {
        context: context,
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
            always: [
              {
                cond: "hasCredential",
                target: "PresentCredential",
              },
              {
                target: "EnterPhoneNumber",
              },
            ],
          },
          EnterPhoneNumber: {
            on: {
              VALID_PHONE_NUMBER: {
                target: "EnterSMSToken",
              },
            },
          },
          EnterSMSToken: {
            on: {
              VALID_TOKEN: {
                target: "PresentCredential",
              },
              CHANGE_PHONE_NUMBER: {
                target: "EnterPhoneNumber",
              },
            },
          },
          PresentCredential: {
            entry: "presentCredential",
            type: "final",
          },
        },
      },
      serviceMap,
    ),
  )
