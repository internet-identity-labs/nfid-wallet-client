import { createMachine, interpret } from "xstate"

/**
 * Creates an invoked child machine actorRef
 * @param machine
 * @returns
 */
export const makeInvokedActor = <T>(machine: any, context: T) => {
  const invokerMachine = createMachine({
    id: "TestInvokerMachine",
    initial: "invoker",
    states: {
      invoker: {
        invoke: {
          id: "invoked",
          src: machine,
          data: () => context,
        },
      },
    },
  }).withContext(context)
  const service = interpret(invokerMachine).start()
  return service.children.get("invoked")
}
