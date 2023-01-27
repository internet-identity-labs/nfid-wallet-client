/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { interpret } from "xstate"

import { im } from "@nfid/integration"
import { ii } from "@nfid/integration"

import { factoryDelegationIdentity } from "frontend/integration/identity/__mocks"
import { mockIdentityClientAuthEvent } from "frontend/integration/windows/__mock"
import { AuthSession } from "frontend/state/authentication"
import { ThirdPartyAuthSession } from "frontend/state/authorization"
import IDPMachine from "frontend/state/machines/authorization/idp"

const challengeMock = jest.fn(async () => ({
  png_base64: "string",
  challenge_key: "ChallengeKey",
}))

// @ts-ignore: with options
ii.create_challenge = challengeMock

const readApplicationsMock = jest.fn(async () => ({
  data: [
    [
      {
        user_limit: 5,
        domain: "test.com",
        name: "string",
      },
    ],
  ],
  error: [],
  status_code: 200,
}))

// @ts-ignore: withoptions
im.read_applications = readApplicationsMock

const handshake = jest.fn(mockIdentityClientAuthEvent)
const getAppMeta = jest.fn(async () => ({
  name: "",
  logo: "",
}))

const testMachine = IDPMachine.withConfig({
  services: {
    async handshake() {
      const r = handshake()
      return {
        maxTimeToLive: r.maxTimeToLive,
        sessionPublicKey: r.sessionPublicKey,
        hostname: "test.com",
      }
    },
    getAppMeta,
  },
}).withContext({ isIframe: false })

const testMachineMockAuthn = testMachine.withConfig({
  services: {
    AuthenticationMachine: async () => {
      return {
        identity: await factoryDelegationIdentity(),
        delegationIdentity: await factoryDelegationIdentity(),
        sessionSource: "remoteDevice",
      }
    },
  },
})

describe("IDP Machine", () => {
  describe("error in handshake service", () => {
    it("transitions to error state", (done) => {
      interpret(
        IDPMachine.withConfig({
          services: {
            async handshake() {
              throw new Error("Invalid derivation origin")
            },
            getAppMeta: jest.fn(async () => ({
              name: "",
              logo: "",
            })),
          },
        }).withContext({ isIframe: false }),
      )
        .onTransition((state) => {
          if (
            state.matches("Start.Handshake.Error") &&
            state.matches("Start.GetAppMeta.Done")
          ) {
            expect(state.context.error?.message).toBe(
              "Invalid derivation origin",
            )
            done()
          }
        })
        .start()
    })
  })
  interpret(testMachine).start()

  it("posts ready message upon initialization", () => {
    expect(handshake.mock.calls.length).toBe(1)
  })

  it("retrieves requesting app meta upon initialization", () => {
    expect(getAppMeta.mock.calls.length).toBe(1)
  })

  describe("authentication", () => {
    it("invokes authentication machine after initialization", (done) => {
      interpret(testMachine)
        .onTransition((state) => {
          if (state.matches("AuthenticationMachine")) {
            expect(state.matches("AuthenticationMachine")).toBeTruthy()
            done()
          }
        })
        .start()
    })

    it("invokes authentication machine with correct context", (done) => {
      interpret(testMachine)
        .onTransition((state) => {
          if (state.matches("AuthenticationMachine")) {
            const context = state.children.authenticate.getSnapshot().context
            expect(Object.keys(context)).toContain("appMeta")
            expect(Object.keys(context)).toContain("authRequest")
            done()
          }
        })
        .start()
    })
  })

  describe("authorization", () => {
    it("invokes authorization machine after authentication", (done) => {
      interpret(testMachineMockAuthn)
        .onTransition((state) => {
          if (state.matches("AuthorizationMachine")) {
            expect(state.matches("AuthorizationMachine")).toBeTruthy()
            done()
          }
        })
        .start()
    })

    it("invokes authorization machine with correct context", (done) => {
      interpret(testMachineMockAuthn)
        .onTransition((state) => {
          if (state.matches("AuthorizationMachine")) {
            const context = state.children.authorize.getSnapshot().context
            expect(Object.keys(context)).toContain("appMeta")
            expect(Object.keys(context)).toContain("authRequest")
            expect(Object.keys(context)).toContain("authSession")
            done()
          }
        })
        .start()
    })
    it("transitions to TrustDevice when WebAuthN capability", (done) => {
      const testMachineMockAuthn = testMachine.withConfig({
        services: {
          AuthenticationMachine: async () => ({} as AuthSession),
          AuthorizationMachine: async () => ({} as ThirdPartyAuthSession),
        },
        guards: {
          isWebAuthNSupported: () => true,
        },
      })
      interpret(testMachineMockAuthn)
        .onTransition((state) => {
          if (state.matches("TrustDevice")) {
            expect(state.matches("TrustDevice")).toBe(true)
            done()
          }
        })
        .start()
    })
    it("transitions to End when WebAuthN capability is not available", (done) => {
      const testMachineMockAuthn = testMachine.withConfig({
        services: {
          AuthenticationMachine: async () => ({} as AuthSession),
          AuthorizationMachine: async () => ({} as ThirdPartyAuthSession),
        },
        guards: {
          isWebAuthNSupported: () => false,
        },
      })
      interpret(testMachineMockAuthn)
        .onTransition((state) => {
          if (state.matches("End")) {
            expect(state.matches("End")).toBe(true)
            done()
          }
        })
        .start()
    })
  })

  // describe("authentication", () => {
  //   describe("known device authentication", () => {
  //     it("renders known device flow when local device data is available", () => {})

  //     it("returns sign identity to parent upon completion", () => {})
  //   })

  //   describe("unknown device authentication", () => {
  //     it("renders unknown device flow when no local device data exists", () => {})

  //     describe("google authentication", () => {
  //       it("opens google oauth window when user selects sign in with google", () => {})

  //       it("assigns jwt on google callback and calls signin lambda", () => {})

  //       it("invokes registration flow if no google account existed", () => {})

  //       it("does not invoke registration flow if google account already exists", () => {})

  //       it("returns a sign identity back to parent machine upon completion", () => {})
  //     })

  //     describe("remote device authentication", () => {
  //       it("navigates to remote device authentication flow", () => {})

  //       it("displays qr code with secret channel for remote device", () => {})

  //       it("polls pubsub channel for messages", () => {})

  //       it("displays loading indicator when it receives mobile is preparing message", () => {})

  //       it("receives sign identity/delegate from pubsub channel", () => {})

  //       it("returns sign identity to parent upon completion", () => {})
  //     })

  //     describe("existing anchor authentication", () => {
  //       it("navigates to existing anchor authentication flow", () => {})

  //       // TODO: more detail here?

  //       it("navigates back to unknown device flow", () => {})

  //       it("returns sign identity to parent upon completion", () => {})
  //     })

  //     it("returns sign identity to parent upon completion", () => {})
  //   })
  // })

  // describe("authorization", () => {
  //   // TODO: more detail

  //   it("does not require unlock when provided with a sign identity", () => {})

  //   it("requires unlock when not provided with a sign identity", () => {})
  // })

  // describe("registration", () => {
  //   // TODO: probably in another module
  // })

  // it("posts delegation upon completion", () => {})
})
