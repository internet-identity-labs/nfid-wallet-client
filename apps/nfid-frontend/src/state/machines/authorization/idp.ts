import { isWebAuthNSupported } from "@nfid/integration"
import { ActorRefFrom, assign, createMachine } from "xstate"

import {
  getAppMeta,
  handshake,
  postDelegation,
} from "frontend/integration/windows/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"
import AuthenticationMachine, {
  AuthenticationMachineContext,
} from "frontend/state/machines/authentication/authentication"
import AuthorizationMachine, {
  AuthorizationMachineContext,
} from "frontend/state/machines/authorization/authorization"

import TrustDeviceMachine from "../authentication/trust-device"

export interface IDPMachineContext {
  authRequest?: {
    maxTimeToLive: bigint
    sessionPublicKey: Uint8Array
    hostname: string
  }
  thirdPartyAuthoSession?: ThirdPartyAuthSession
  appMeta?: AuthorizingAppMeta
  error?: Error
}

export type IDPMachineEvents =
  | { type: "done.invoke.handshake"; data: AuthorizationRequest }
  | { type: "error.platform.handshake"; data: Error }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.done"; data: void }

interface Schema {
  context: IDPMachineContext
  events: IDPMachineEvents
}
const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccMAJPAOwlgAs8BrMDAMTBwGNqBiCAe3MeTkAbjwYZalGvTCJQaHrGQ5kfWSAAeiACwAGAMwYAjAA4A7AFY9ew+a3GAnPdMAaEAE9E1gEwYdfv4bWxgBswTrGAL4RrqiYuITEAOKsAIJoaACyrHjMrBzcfALCoowwOGmZ2WryisqqSBraXloYloZeXubGZnpa5sEu7ojm9j7+fqY6wfbB3XpRMejY+EQF-Biw+DgCS-FE1QpKKuRqmgjGOoYYpl7B5jpOlv0hrh4IejMYjt8XpiZe4VMCxAsQwKQArjhqGByMo2Hg6uQMngOIIwGsiiIxHhIdDYch4dsDrVjqdEIYdF4ruFjFpOjo+vY9F5Bm87AYdDdbqYtEzzBZgsDQRCoTwCMgAF4I47I1H8DEYQRYxg40XiiUyBo1I71UBnCksoy6D7mbmGWbmV6IWY+fm84z9Tmm3pCpYAFQI4M2ABEwEICejeOtNgidpgPV6cL7-WxNXJDoiyQg7MEjKatFY9M7bg6rQhzXcMCFOlndMb7JFoiD3Z6fX6AwqlSUMBG6zGwLLqGjiTqTg0ziMOVpTBc7KbDFpJ3nabamcEOsZmmZ51Eq+QeBA4GpQXtiGRJLQxCx2NQe4n++TKXm9H5fONAiZQuFXXEVnuKFRD4xvYUz6SLwgXT2EW9hTA8oz2CMhjXp0GC8t8FaGOahiOC+ywJKQH5SAwf66o0CAjnmHSmL4XhmOESEUn8IRobuGDJOU6RZPguQnrhfZ6peXh5vywEIU4dxTIugpVjub70akTHZBgP78OxSbBDYvg2F07SQcYE55mE5itOM5j9Lcw5aLR4kMRUzF4PJAGmMBi50lmjh+AC5o8ZypE9GRnS3L08yibsb5WZxgFaHmNgtDo-IOSMDIoS6fmYCKeJwtKfCdt2WoJv+QX2Ep4RARWXgfKYpjBNew5wQhvz-ICaGJWKkopUiKJdnJGUknhZxMlcoFmE4MyKUh9g8XYGA3jZkymHotIhIYaGtlG9axoF+FmDpsxaKEXkRYVpVDARhbBHYWjtJcswMmhACilDLWchU6Rmq0ApN1gVsY04UhgimTkZxphL5ixoDdng6O9vghH4swTjlkWrhEQA */
  createMachine(
    {
      tsTypes: {} as import("./idp.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "idp",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            Handshake: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "handshake",
                    id: "handshake",
                    onDone: [
                      {
                        actions: "assignAuthRequest",
                        target: "Done",
                      },
                    ],
                    onError: "Error",
                  },
                },
                Error: {
                  onEntry: "assignError",
                },
                Done: {
                  type: "final",
                },
              },
            },
            GetAppMeta: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "getAppMeta",
                    id: "getAppMeta",
                    onDone: [
                      {
                        actions: "assignAppMeta",
                        target: "Done",
                      },
                    ],
                  },
                },
                Done: {
                  type: "final",
                },
              },
            },
          },
          onDone: {
            target: "AuthenticationMachine",
          },
        },
        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: "AuthorizationMachine",
            data: (context) =>
              ({
                appMeta: context.appMeta,
                authRequest: context.authRequest,
              } as AuthenticationMachineContext),
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            onDone: [
              { target: "TrustDevice", cond: "isWebAuthNSupported" },
              { target: "End" },
            ],
            data: (context, event) =>
              ({
                appMeta: context.appMeta,
                authRequest: context.authRequest,
                authSession: event.data,
              } as AuthorizationMachineContext),
          },
        },
        TrustDevice: {
          entry: "assignAuthoSession",
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: "End",
          },
        },
        End: {
          invoke: {
            src: "postDelegation",
            id: "done",
          },
          type: "final",
        },
      },
    },
    {
      services: {
        handshake,
        getAppMeta,
        postDelegation,
        AuthenticationMachine,
        AuthorizationMachine,
        TrustDeviceMachine,
      },
      actions: {
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data,
        })),
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
        assignAuthoSession: assign({
          thirdPartyAuthoSession: (context, event) => event.data,
        }),
        assignError: assign({ error: (context, event) => event.data }),
      },
      guards: {
        isWebAuthNSupported,
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
