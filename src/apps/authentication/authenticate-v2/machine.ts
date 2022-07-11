import { createMachine } from "xstate"

interface Context {
  userNumber?: bigint
  applicationUserLimit?: number
}

type Events =
  | { type: "LOGIN_COMPLETE" }
  | { type: "RECEIVE_DELEGATE" }
  | { type: "DONT_REGISTER" }
  | { type: "REGISTER" }
  | { type: "DEVICE_REGISTERED" }
  | { type: "AUTHENTICATED" }

type Services = {}

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFmAduglgMYCG6YAdACJhkBOAtvjmNQG5FgDK6pqsAxIlAAHAPax8BUTiEgAHogDMARmXkA7MoAMAVgBsADgCcAFnU6d6vToA0IAJ6I1indvXuATFZOK9eowYAvoF2aFi4BCRk5GHYeESkYPzIAKoAKgASAKIAcmkAkgDCyGlZlLJiElIySPJKRuT6HiZG1kaKHnq+do4IJlrq5EYBnf3aulbBoRhxkYnkAEpg9KJksREJZPwLWYVZ+QBqWQD6lFkAMlkA4iVZFeKS+NKyCgiK-eSKBs3qBnrK6hM-1sDkQXgMnw8+j0Hg8Bi0ig66imIHW8SiFCWUHwsDobA41EI+AgYFo-EoAHk8scdld8pxSgt7lUnjVQK8XB5yAYzB5WupwTpvj1EDo+eRlEZlHoTKovEY4ToUWi5tEsTi8WB2IQWGAiSSybT6YzmY9nrVXjKucYtMofFCvgYhSK3gYIS1vkZzK4AV9FMqZhsMYswNjcaT8TryVkDkUTkaGVkduVapUzWy6ghgRK-sMdC4ml8XXpbeQTCYPC5EbKtBW9MEQiAcKISfBairNhRqHRGMxI1weOg+Kbqi9EABaLSfIxaf56dStFxaZfNPQu8c6CUmN08jzSrTGb4eAPhdHzDsYkessdvTf+fNuXQGAFwl2SiGwnkClddCtBRsXvMSwrGsgZnmQV7muySgeFOUpWFCrhAjoWgeG+ATkJ+riVtKZg6O0J6zJ2IZhpq2q6vqpKQRmHLKIoW6yv4ZioQYKgumMZYjP85jNN8SoAWBqqYqGGoRlqHDUTe-wfoiUoWAMyijC6KGDKhMqyuWkqmPohFBueMyiLQ+AAF5gMgwjCAANps16pg8o4WjBU4+CopiVtYXiKC66iKA04K+G4soGL8ungWAkmOQg47NNOs7SguXQoSu66-FuboziW7yHkYDaBEAA */
  createMachine({
    context: {} as Context,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    schema: { events: {} as Events, services: {} as Services },
    id: "Authenticate",
    initial: "DetermineDeviceStatus",
    states: {
      DetermineDeviceStatus: {
        always: [
          {
            cond: "isDeviceRegistered",
            target: "Authenticate",
          },
          {
            target: "RemoteAuthenticate",
          },
        ],
      },
      Authenticate: {
        on: {
          AUTHENTICATED: {
            target: "AuthorizeApplication",
          },
        },
      },
      RemoteAuthenticate: {
        on: {
          RECEIVE_DELEGATE: {
            actions: "ingestDelegate",
            target: "RegisterDeviceDecider",
          },
        },
      },
      RegisterDeviceDecider: {
        on: {
          DONT_REGISTER: {
            target: "AuthorizeApplication",
          },
          REGISTER: {
            actions: "ingestDevice",
            target: "RegisterDevice",
          },
        },
      },
      RegisterDevice: {
        on: {
          DEVICE_REGISTERED: {
            target: "AuthorizeApplication",
          },
        },
      },
      AuthorizeApplication: {
        type: "final",
      },
    },
  })
