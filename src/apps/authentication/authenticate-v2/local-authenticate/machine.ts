import { createMachine } from "xstate"

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgewE4EsAvMAOgBEx0xcBbfAOzGQAdmAbfAYwEN19t6AYQFUAHugDEiUM2yx8fAdJCjEATgDMJAGwBWAOwBGAwA4ALACZ9F3WoA0IAJ6IbABhKu1Z-SYtm1hhrWumYAvqEOaFh4RKRROATEAMoMUGxMnJzYqPToLOxcvPz0EsgAqgAqABIAogByFQCSgsgVNWTKsvKK9MqqCPr6ZiQmuoZqthba2mquRg7OCBbmJFNq2hZ+Jq4b2mERIPExxCRHiWAAsqhsfMiZ2bn5HDw9pZW1Dc2t7Z1yCsV9RC6Vy6EgGWwBbTmCwaExeBaIMx6Dz6bSGbQaPZzDb6DThA70bAQODKM6xciUah0RhPQo9YS5MDiX7dAFIFSIIw6fwaMyGEFmEzbCyGBEIYxqEhqaXrPxqQa84zhSIYBLksnJVLpO5ZHJ5VjPIpKdldf7G0D9SzDPR8zz+YG6NFiqz6Eio9bjOa6EwY1x4g4auKq46Xa63e562kvNkyP49QEISwmHQhQzjXGGNwaMWY7Ru7ZzExBWZQtTKw7B84kJJgdKcPIR3Iss29dmWiarXSOoUaAz6b32JxAjY6KHaVyWCzy7zacuB5vxtuI117TS2kJC1wisU+qUy3RTazmCZl-FAA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      id: "Authorize",
      initial: "DetermineApplicationContext",
      states: {
        DetermineApplicationContext: {
          // always: [
          //   {
          //     cond: "isSingleAccountApplication",
          //     target: "AuthorizeSingleAccountApplication",
          //   },
          //   {
          //     target: "AuthorizeMultiAccountApplication",
          //   },
          // ],
        },
        AuthorizeSingleAccountApplication: {
          on: {
            AUTHENTICATED: {},
          },
        },
        AuthorizeMultiAccountApplication: {
          on: {
            AUTHENTICATED: {
              target: "SelectAccount",
            },
          },
        },
        SelectAccount: {},
      },
    },
    {
      actions: {},
      services: {},
      guards: {},
    },
  )
