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
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import AuthorizationMachine, {
  AuthorizationMachineContext,
} from "frontend/state/machines/authorization/authorization"

export interface IDPMachineContext {
  authRequest?: {
    maxTimeToLive: number
    sessionPublicKey: Uint8Array
    hostname: string
  }
  appMeta: AuthorizingAppMeta
}

export type IDPMachineEvents =
  | { type: "done.invoke.handshake"; data: AuthorizationRequest }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.done"; data: void }

interface Schema {
  context: IDPMachineContext
  events: IDPMachineEvents
}
const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEsIAcB0BlALgQwCccMAJPAOwlgAs8BrMDAMTBwGNqBiCAe3MeTkAbjwYZalGvTCJQaHrGQ5kfWSAAeiACwAGAMwYAjAA4A7AFY9ew+a3GAnPdMAaEAE9E1gEwYdfv4bWxgBswTrGAL4RrqiYuITEAOKsAIJoaACyrHjMrBzcfALCoowwOGmZ2WryisqqSBraXloYloZeXubGZnpa5sEu7ojm9j7+fqY6wfbB3XpRMejY+EQF-Biw+DgCS-FE1QpKKuRqmgjGOoYYpl7B5jpOlv0hrh4IejMYjt8XpiZe4VMCxAsQwKQArjhqGByMo2Hg6uQMngOIIwGsiiIxHhIdDYch4dsDrVjqdhl5XohDJcdBgtN8nHcpsZOsDQRCoTwCMgAF4I47I1H8DEYQRYxg4zncnkyBo1I71UBncwUoYIQL0unfLRWJxeanmKLREDkHgQOBqUF7YhkSS0MQsdjUYkKk4NM7U1VvPR+XzjQImULhNm7FY2ihUe2MAAihRdiLJCC69gwDimD1G9hGhkp706WoZxkMhmChkcIbiYdIEakDHjpPdiFMxlzhlMwT9-gDITCkWNVqryXK6Sy+FyTvrisa6p0XuGphTDMZ91mtwrywSGCHFVHOVj-EnbqViFL5l8Ni67SzRa0ubCZ-u-nM-VuWlMWnX1q3qRHVTlhwTRsEGbXM+g7cZLiCIM+0WSsEkPRNbFbfROz8H1DF0Isi3XDk8Thfk+EFag0QQoD7BsXxjGTewWQ+Ux21zXpTALRxfn+QEcNxLleQIpEUWIg9-xJKczmaAwWRvMIaPMG4VVzGZaSXdsVxZYJ1wAUUoUjjwQDpaWCTpZxCKx6MGN4A2Yhlgi0ekZOMeZ+3QbTpy8Fs1R9VCIPGByoiAA */
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
              invoke: {
                src: "handshake",
                id: "handshake",
              },
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
                  },
                },
                Done: {
                  type: "final",
                },
              },
            },
            GetAppMeta: {
              invoke: {
                src: "getAppMeta",
                id: "getAppMeta",
              },
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
          onDone: "AuthenticationMachine",
        },
        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: "AuthorizationMachine",
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            onDone: "End",
            data: (context, event) =>
              ({
                authSession: event.data as AuthSession,
                appMeta: context.appMeta,
                authRequest: context.authRequest,
              } as AuthorizationMachineContext),
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
      },
      actions: {
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data,
        })),
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
