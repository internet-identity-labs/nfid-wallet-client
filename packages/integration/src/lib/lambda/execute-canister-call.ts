import {Actor, ActorSubclass, Agent, HttpAgent} from "@dfinity/agent";
import {IDL} from "@dfinity/candid";

export async function executeCanisterCall(idl: any, canisterId: string, ...parameters: any[]) {
  const agent: Agent = await new HttpAgent({ host: "https://ic0.app" })
  const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
    IDL.Service(idl)
  const actor: ActorSubclass = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  })
  return await evaluateMethod(actor, getMethodName(idl), ...parameters)
}

export async function evaluateMethod(
  actor: ActorSubclass,
  methodName: string,
  ...parameters: any[]
) {
  return actor[methodName](...parameters)
}

function getMethodName(obj: any) {
  if (Object.keys(obj).length > 1) {
    throw Error("More than one method in idl")
  }
  const methodName = Object.keys(obj)[0];
  if (methodName) {
    return methodName;
  } else {
    throw new Error(`No method found in the object.`);
  }
}
