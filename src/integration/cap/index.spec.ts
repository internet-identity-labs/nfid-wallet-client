/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { HttpAgent, Certificate, CanisterStatus, Cbor, ActorSubclass, Actor } from "@dfinity/agent"

import { Ed25519KeyIdentity } from "@dfinity/identity"
import { IDL } from "@dfinity/candid"
import { Interface } from "readline"
import { writeFileSync } from "fs"

describe("cap suite", () => {
  jest.setTimeout(10000)
  describe("cat txHistory", () => {
    it("getUserTransactions", async function() {
      let canisterId = Principal.fromText("jiept-kaaaa-aaaao-aajsa-cai")
      let agent = new HttpAgent({ host: "https://ic0.app" })
      console.log("--------------------------------------------------------RETRIEVE CANDID FILE------------------------------------------------------------------------------------")

      const encoder = new TextEncoder()
      //
      // console.log(a)
      let pathCandid = [
        new TextEncoder().encode("canister"),
        new DataView(canisterId.toUint8Array().buffer).buffer,
        new TextEncoder().encode("metadata"),
        new TextEncoder().encode("candid:service"),
      ]

      var responseCandid = await agent.readState(canisterId,
        { paths: [pathCandid] })

      const certCandid = await Certificate.create({
        certificate: responseCandid.certificate,
        rootKey: agent.rootKey,
        canisterId: canisterId,
      })

      const dataCandid = certCandid.lookup(pathCandid)

      let result = new TextDecoder().decode(dataCandid)


      writeFileSync('/Users/oleksis/IdeaProjects/nfid-frontend/src/integration/_ic_api/candid_temp.js', result!, {
        flag: 'w',
      });


      console.log("-----------------------------------------------------------PARSE CANDID FILE AND RETRIEVE METADATA---------------------------------------------------------------------------------")



     console.log(result)

      console.log("--------------------------------------------------------TRANSFORM  CANDID TO JS------------------------------------------------------------------------------------")

      let js = await didToJs(result, agent, "a4gq6-oaaaa-aaaab-qaa4q-cai")

      console.log(js)

      console.log("--------------------------------------------------------TRANSFORM  STRING JS TO IDL FACTORY------------------------------------------------------------------------------------")
      let actorAAA: ActorSubclass
      // console.log(js)
      //TODO
      // writeFileSync('/Users/oleksis/IdeaProjects/nfid-frontend/src/integration/_ic_api/temp_idl.js', js!, {
      //   flag: 'w',
      // });
      let module = await import("/Users/oleksis/IdeaProjects/nfid-frontend/src/integration/_ic_api/temp_idl.js")
      actorAAA = Actor.createActor(module.idlFactory, { agent, canisterId })



      console.log("----------------------------------------------------------EVALUATE METHOD----------------------------------------------------------------------------------")

        let methodName = "read_applications"

      let rr = await eval( "actorAAA."+methodName+"()")

      console.log("----------------------------------------------------------RESULT--------------------------------------------------------------------------------")

      console.log(rr)


      console.log("---------------------------------------------------------KYC FOR TRUSTED APPS----------------------------------------------------------------------------------")

    })
  })
})


async function didToJs(candid_source: string, agent: any, didjs_id: string): Promise<undefined | string> {
  const didjs_interface: IDL.InterfaceFactory = ({ IDL }) => IDL.Service({
    did_to_js: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
  })
  const didjs: ActorSubclass = Actor.createActor(didjs_interface, { agent, canisterId: didjs_id })
  const js: any = await didjs.did_to_js(candid_source)
  if (js === []) {
    return undefined
  }
  return js[0]
}

// @ts-ignore
const decodeCbor = (buf) => {
  return Cbor.decode(buf)
}

interface ExternalConfig {
  candid?: string;
}

const hasExternalConfig = new URLSearchParams(window.location.search).has(
  "external-config",
)
export const EXTERNAL_CONFIG_PROMISE: Promise<ExternalConfig> = new Promise(
  (resolve) => {
    if (!hasExternalConfig) {
      return resolve({})
    }
    let resolved = false

    // // Listen for "config" messages
    // addMessageListener((message) => {
    //   if (message?.type === "config") {
    //     resolved = true;
    //     return resolve({ ...message.config });
    //   }
    // });

    setTimeout(() => {
      if (!resolved) {
        console.error("External config timeout")
        resolve({})
      }
    }, 3000)
  },
)
