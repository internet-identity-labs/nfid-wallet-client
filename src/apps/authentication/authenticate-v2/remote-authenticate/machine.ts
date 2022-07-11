import { createMachine } from "xstate"

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgewE4EsAvMAOgGUwAbMAY3TSzADt18aBDV7JgYgHEA8gL4AZAKKJQAB2yx8XJpJAAPRAFoATAA4ALCR06AnAFZDANh0aNOgIxmAzPYA0IAJ6IbWwyTuGbJ42N7AAYQ4I0AXwiXBhwCYnIqWnoMTGZWDgUeACUxAFkBABUJJBAZOQUlVQR-MxJDHUCbHS1g4LMHMxd3BDV7DW9DYM8HUMDjG2MomNS8IlIKajpY9LZOfG4eIoAJMWylcvkNxVLqtSMSDVD2w0d7W8atbvVtGxItMyt7LUD7jQB2Gz-aYgWJzBLZMAAW2w6DAKxYayyuQAwmIAJIANTEAH0ACJicSFZB8ErSWRHbhVDzGOr-EJmPzBVo6frONzqLRaS7GK4TYItew2exBEFg+KkASMXAIjLrTaojHY-GEsTE0kHCmVU7qEyXeysyb9f6GVq6Z4IQI+DT+CbWDq8rk6MWzCUkKVpGWpVaZY48ABCyBRAGkcYUBDiyKqUYV0QIAHKairHam9G16DoDIbBf7aYZdDm9fxvRkG8LDWymrlRaIgJjYCBwJTi+aJJYpRiI31U0qHbWgM4G+zvOytSYCmzhOwWvr2Oo6YY-Mws9oml1YcGkSEwuGypEp3tag8DjwhertAwNHM6f4tHQzjRz-XjRxaAE2hzruKtj1gL2duV+zKI8exPItmhIexAVCRpH2ZZcZzMYxLgXZkAS0SdWn+Mwv03Eg90ySAk0pE4wLUQwNHeU17j8W5V1ZC1+j0f5jFsG1WMMQFmlwiViKAwczH+Edl2GYwJynAsenOYJvAXEYrFpMw7BrCIgA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      id: "Authorize",
      initial: "SelectAuthentication",
      states: {
        SelectAuthentication: {
          on: {
            GOOGLE: {
              target: "Authenticated",
            },
            REMOTE: {
              target: "RemoteAuthentication",
            },
            OTHER: {
              target: "OtherAuthentication",
            },
          },
        },
        RemoteAuthentication: {
          on: {
            RECEIVE_DELETAGE: {
              target: "Authenticated",
            },
          },
        },
        OtherAuthentication: {
          on: {
            RECEIVE_DELETAGE: {
              target: "Authenticated",
            },
            BACK_TO_SELECTION: {
              target: "SelectAuthentication",
            },
          },
        },
        Authenticated: {
          type: "final",
        },
      },
    },
    {
      actions: {},
      services: {},
      guards: {},
    },
  )
