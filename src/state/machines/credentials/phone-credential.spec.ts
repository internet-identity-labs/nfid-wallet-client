// /* eslint-disable jest/no-conditional-expect */
// import { Ed25519KeyIdentity } from "@dfinity/identity"
// import { interpret } from "xstate"

// import { factoryDelegationIdentity } from "frontend/integration/identity/__mocks"
// import { factoryCertificate } from "frontend/integration/verifier/__mocks"

// import machine from "./machine"

// const testIdentity = Ed25519KeyIdentity.generate()

// const testMachine = machine.withConfig({
//   services: {
//     fetchPrincipal: async () => {
//       const principal = testIdentity.getPrincipal()
//       return principal
//     },
//     async verifyPhoneNumber() {
//       return true
//     },
//     async fetchPhoneNumber() {
//       return "+12508675309"
//     },
//     async resolveToken() {
//       return factoryCertificate()
//     },
//     async fetchAppDelegate() {
//       const delegation = await factoryDelegationIdentity()
//       return delegation
//     },
//     async resolveCredential() {
//       return
//     },
//   },
// })

// describe("phone credential flow", () => {
//   it("performs basic state transitions", (done) => {
//     interpret(testMachine)
//       .onTransition((state) => {
//         if (!state.matches("GetPhoneNumber.GetExistingPhoneNumber")) return
//         expect(true).toBeTruthy()
//         done()
//       })
//       .start()
//       .send("LOGIN_COMPLETE")
//   })

//   it("has no principal to begin with", (done) => {
//     expect(
//       interpret(testMachine).start().state.context.principal?.toText(),
//     ).toBeUndefined()
//     done()
//   })

//   it("ingests principal from authentication", (done) => {
//     interpret(testMachine)
//       .onTransition((state) => {
//         if (state.matches("GetPhoneNumber.GetExistingPhoneNumber")) {
//           expect(state.context.principal?.toText()).toBe(
//             testIdentity.getPrincipal().toText(),
//           )
//           done()
//         }
//       })
//       .start()
//       .send("LOGIN_COMPLETE")
//   })

//   it("each test receives a new machine", (done) => {
//     expect(
//       interpret(testMachine)
//         .onTransition(() => done())
//         .start()
//         .state.matches("AuthenticateUser"),
//     ).toBeTruthy()
//   })

//   const testMachineNoPhoneNumber = testMachine.withConfig({
//     services: {
//       async fetchPhoneNumber(): Promise<string> {
//         return await new Promise((res, rej) => rej(""))
//       },
//     },
//   })

//   it("activates GetPhoneNumber flow when user has no phone number", (done) => {
//     interpret(testMachineNoPhoneNumber)
//       .onTransition((state) => {
//         if (state.matches("GetPhoneNumber.EnterPhoneNumber")) {
//           expect(state.matches("GetPhoneNumber.EnterPhoneNumber")).toBeTruthy()
//           done()
//         }
//       })
//       .start()
//       .send("LOGIN_COMPLETE")
//   })

//   let d0 = false // todo this done flag sucks
//   it("activates ResolveCredential flow when user has phone number", (done) => {
//     interpret(testMachine)
//       .onTransition((state) => {
//         expect(state.matches("GetPhoneNumber.EnterPhoneNumber")).toBeFalsy()
//         if (state.matches("HandleCredential.ResolveCredential")) {
//           expect(
//             state.matches("HandleCredential.ResolveCredential"),
//           ).toBeTruthy()
//           !d0 && done()
//           d0 = true
//         }
//       })
//       .start()
//       .send("LOGIN_COMPLETE")
//   })

//   let d = false // todo this done flag sucks
//   it("shows an error when user neglects to input their SMS token", (done) => {
//     const machine = interpret(testMachineNoPhoneNumber)
//       .onTransition((state) => {
//         if (
//           state.matches("GetPhoneNumber.EnterSMSToken") &&
//           state.context.error
//         ) {
//           expect(
//             state.matches("GetPhoneNumber.EnterSMSToken") &&
//               state.context.error,
//           ).toBeTruthy()
//           !d && done()
//           d = true
//         }
//       })
//       .start()
//     machine.send("LOGIN_COMPLETE")
//     setTimeout(
//       () => machine.send({ type: "ENTER_PHONE_NUMBER", data: "+12508675309" }),
//       1,
//     )
//     setTimeout(() => machine.send({ type: "ENTER_SMS_TOKEN", data: "" }), 2)
//   })

//   const testMachineSMSTokenFails = testMachineNoPhoneNumber.withConfig({
//     services: {
//       async verifySMSToken() {
//         throw new Error("SMS verification failed, please try again.")
//       },
//     },
//   })

//   let d2 = false // todo oh my this sucks even more
//   it("shows an error when sms token verification fails", (done) => {
//     const machine = interpret(testMachineSMSTokenFails)
//       .onTransition((state) => {
//         if (
//           state.matches("GetPhoneNumber.EnterSMSToken") &&
//           state.context.error
//         ) {
//           expect(state.matches("GetPhoneNumber.EnterSMSToken")).toBeTruthy()
//           expect(state.context.error).toBe(
//             "SMS verification failed, please try again.",
//           )
//           !d2 && done()
//           d2 = true
//         }
//       })
//       .start()
//     machine.send("LOGIN_COMPLETE")
//     setTimeout(
//       () => machine.send({ type: "ENTER_PHONE_NUMBER", data: "+12508675309" }),
//       1,
//     )
//     setTimeout(
//       () => machine.send({ type: "ENTER_SMS_TOKEN", data: "111111" }),
//       2,
//     )
//   })
// })

export {}
