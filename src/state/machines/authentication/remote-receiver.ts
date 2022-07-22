import { ActorRefFrom, createMachine } from "xstate"

import { RemoteDeviceAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

export interface Context {
  secret: string
  authSession?: RemoteDeviceAuthSession
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "AWAIT_DELEGATION" }
  | { type: "RECEIVE_DELEGATION"; data: RemoteDeviceAuthSession }

const RemoteReceiverMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMPMAYzAEsA3MXAOgCVKb7GBBAd2WvQDEnAOqcAkgBUA+gBEAogBk5AcU4SxAeQByiUAAcisftSIA7XSAAeiAIwBOAByMALAHZ7AZnuuArDYBs-nYANCAAnrauTq4ATK4e-j7OMTYeUf7OAL6ZoWhY5MSk5FR0DCxspVy8-ALMcgDCcmIAanKyiipqmjpIIAZG6CbmvdYI9k5unt5+gSHhiB4ADB6MMTHJzj4O24uJdtm5GDj4hWT4JfRMrBdgVXzoMmAANmBQyINmtQ1Nre1KquptBZ+sYzBZRv5UowfF4Yhldg47GtnKEImMooxYvFEslUuksjkQHljoQSGcKpdyjcBBAzLdYOh3rdiQUycV2GVrhzgYZQcNQKNNj4XHY0j5losHD5HP5UYghYw7K43HCfBlfHZFq4DkSjqyiucOUwJLhUAzHrRqFRGABlZ6UQQSZgAVRtEh5AyG4MQMQcNkYyxidjsiV8MTSHh8coQ8RWdmcHiRWviUo8BMO+RObMNpWNpvNYEt1rtLwoghk2mkTtd7t6II+-KsC0Wi0YDl2aY8622mwc0f8S0YA6WKTVNlcMp1LKzBopZRNZoehattzEsAAskQAEbUF7CMBbzhHUwCD1870IRITNVjnxh6X9wctxYxRabLv+BzOfxTvUz8k3Hmi4Wiu5RQNQDIMMI-CYPuh7HjSdKMNQpi0EQADWtz4OBkG4NBWBwUeWCNvWXojIgriLHYAZjiG4p+D4ML9hkQ5uIsPhrEGzg2M4Di-pmpKzoBjALgWRa3KwOGkHhMF2hQqC4PwYQANJgGEiGmLcKFoZhjDYQMUGyZQClKapaL6LyDYXpCTjBmmcLhrxNgvtG8StnYPHfq4n7bEE-Ekqc7K5iJ+ZLuJGn0oypCMNOgkAUaIXAcuVBnlZ5EIMGwoeGmGRwh4fpplG8wIGxjCRoEb75QOiw2OO2SEqYRAQHAFixYFOaUlylQ8PcqVkQKFExNGNjtm2DivhxoqxCkP6Em12Zzlcc53PwjwvG8aUWZ6YLpdxKxaiNooJIEHHDbEmIBAmd7xsGdH+fq8XBV1HByKYEB9TtA0IONTipDYvrKv975DcVI3+u4MIOP4cTsUkSL3f+QWdXOH2NoKfbFcGmJrP4ypQwEMR+Nqc1-nFSPzqFIHFvaZaoxeNh3piMLcbx+Xtr6GNotDziMP9r4eaKSTeAjZMdRTSXiYwa6bjue4HkRmAkZZ-VNiVI2Ks4wabIk2UM7KxVYi4XbBrVbhmz4IvtYtiViaBr3vXWyufar37UckL4pEsdhqr6-brLzaySmsjHcYTlsLcJolhaBkkQdJ+GwfLx50+lSLUeK36Z343HuP2vguJC-1+lDvkWyTAlW5HlPJRJrxx4ZWBySZ6AqWpKdfYE-pBusiaUes4pzGi408+4XspNs3s2OHQkJVHVNgO3qupCsvhpjxDhsy+2zRox-pF-lXbs7s6a6hXEcJfbi+jL4e8huxuxg-GnPygObba5s7jBi2fHlwF5+5lfH0KJipwmxoiNYX5UiBGcG4eqmQgA */
  createMachine(
    {
      tsTypes: {} as import("./remote-receiver.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      initial: "Receive",
      id: "auth-remote-receiver",
      states: {
        Receive: {
          initial: "Await",
          states: {
            Await: {
              on: {
                AWAIT_DELEGATION: {
                  target: "AwaitDelegation",
                },
                RECEIVE_DELEGATION: {
                  target: "End",
                },
              },
            },
            AwaitDelegation: {
              on: {
                RECEIVE_DELEGATION: {
                  target: "End",
                },
              },
            },
            End: {
              type: "final",
            },
          },
          onDone: {
            target: "End",
          },
        },
        End: {
          type: "final",
          data: (context) => context.authSession,
        },
      },
    },
    {},
  )

export type RemoteReceiverActor = ActorRefFrom<typeof RemoteReceiverMachine>

export default RemoteReceiverMachine
