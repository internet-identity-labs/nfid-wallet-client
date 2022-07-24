import { createMachine } from "xstate"

import { registerServiceResponseMock } from "frontend/integration/internet-identity/services.mocks"

export const mockRegistrationSuccessMachine = createMachine(
  {
    id: "mock-registration",
    initial: "Start",
    states: {
      Start: {
        invoke: {
          id: "registerServiceResponseMock",
          src: "registerServiceResponseMock",
          onDone: "End",
        },
      },
      End: {
        type: "final",
        // @ts-ignore: typegen sux a bit
        data: (context, event) => event.data as LocalDeviceAuthSession,
      },
    },
  },
  {
    services: {
      registerServiceResponseMock,
    },
  },
)
