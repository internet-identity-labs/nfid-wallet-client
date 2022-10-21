/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { HttpAgent, Certificate, CanisterStatus, Cbor, ActorSubclass, Actor } from "@dfinity/agent"

import { Ed25519KeyIdentity } from "@dfinity/identity"
import { IDL } from "@dfinity/candid"
import { Interface } from "readline"

describe("cap suite", () => {
  describe("cat txHistory", () => {
    it("getUserTransactions", async function() {
      let canisterId = Principal.fromText("jiept-kaaaa-aaaao-aajsa-cai")
      let agent = new HttpAgent({ host: "https://ic0.app" })
      // @ts-ignore
      // let path11 = [new TextEncoder().encode("canister"), canisterId.toUint8Array().buffer, new TextEncoder().encode("controllers")]
      //
      // var response = await agent.readState(canisterId,
      //   { paths: [path11] })
      //
      // const cert = await Certificate.create({
      //   certificate: response.certificate,
      //   rootKey: agent.rootKey,
      //   canisterId: canisterId,
      // })
      //
      // const data = cert.lookup(encodePath("controllers", canisterId))
      //
      // // @ts-ignore
      // const decodeControllers = (buf) => {
      //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //   // @ts-ignore
      //   const [tag, ...controllersRaw] = decodeCbor(buf)
      //   // @ts-ignore
      //   return controllersRaw.map((buf) => {
      //     return Principal.fromUint8Array(new Uint8Array(buf))
      //   })
      // }
      // let conte = decodeControllers(data)
      //
      // let p = conte[0].toText()
      //
      // console.log(p)

      console.log("--------------------------------------------------------------------------------------------------------------------------------------------")
      // let a = await CanisterStatus.request({canisterId, agent, paths: ["candid"]})
      const encoder = new TextEncoder();
      //
      // console.log(a)
      let pathCandid = [
        new TextEncoder().encode("canister"),
        // new DataView(new TextEncoder().encode("canister").buffer).buffer,
        new DataView(canisterId.toUint8Array().buffer).buffer,
        new TextEncoder().encode("metadata"),
        new TextEncoder().encode("candid:service")
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
      console.log(result)



      let js = await didToJs(result,agent,"a4gq6-oaaaa-aaaab-qaa4q-cai");

      console.log(js)
      const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(js!);

      // @ts-ignore
      import('data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw==')
        .then(module => console.log(module));
      // console.log(dataUri)
      // import(dataUri).then(async module => {
      //
      //   const actor: ActorSubclass = Actor.createActor(module.idlFactory, { agent, canisterId });
      //   let rr = await actor.get_account();
      //   console.log(rr)
      // })
      // const candid: any = await eval('import("' + dataUri + '")');


      //
      // let rr = await actor.get_account();
      // console.log(rr)

      // CanisterStatus.request()

      //     let address =
      //       "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
      //     let mockTransactionTo: TransactionPrettified = mockTransaction
      //     mockTransactionTo.details.to =
      //       "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
      //     let mockTransactionFrom: TransactionPrettified = mockTransaction
      //     mockTransactionFrom.details.from =
      //       "79867ae4c39553850f70fc3c1f208966f22818bce8b00dff272cfff59786c66b"
      //     jest
      //       .spyOn(mockUtil, "getCapRootTransactions")
      //       .mockImplementationOnce(() => Promise.resolve([mockTransactionTo]))
      //       .mockImplementationOnce(() => Promise.resolve([mockTransactionFrom]))
      //       .mockImplementationOnce(() => Promise.resolve([]))
      //     let response = await mock.getUserTransactions(
      //       "dcbuw-wyaaa-aaaam-qapfq-cai",
      //       Principal.fromText(
      //         "tn74f-iacec-blwhn-qymcu-i6zmt-toa3i-hwqqs-g2j5u-ekp5m-3m26i-3ae",
      //       ),
      //       0,
      //       3,
      //     )
      //     expect(response.txHistory.length).toEqual(2)
      //     expect(response.txHistory[0]).toEqual(mockTransactionTo)
      //     expect(response.txHistory[1]).toEqual(mockTransactionFrom)
      //     expect(response.isLastPage).toEqual(true)
      //   })
      //
      //   it("getTokenTxHistoryOfTokenIndex", async function () {
      //     let encodedToken = encodeTokenIdentifier(
      //       "dcbuw-wyaaa-aaaam-qapfq-cai",
      //       89,
      //     )
      //     let mockTransactionToken: TransactionPrettified = mockTransaction
      //     mockTransactionToken.details.token = encodedToken
      //     jest
      //       .spyOn(mockUtil, "getCapRootTransactions")
      //       .mockReturnValue(Promise.resolve([mockTransactionToken]))
      //     let response = await mock.getTokenTxHistoryOfTokenIndex(
      //       "dcbuw-wyaaa-aaaam-qapfq-cai",
      //       "z4j3m-4akor-uwiaa-aaaaa-deadz-maqca-aaabm-q",
      //       0,
      //       2,
      //     )
      //     expect(response.txHistory.length).toEqual(2)
      //     expect(response.txHistory[0]).toEqual(mockTransaction)
      //     expect(response.txHistory[1]).toEqual(mockTransaction)
      //     expect(response.isLastPage).toEqual(false)
    })
  })
})


async function didToJs(candid_source: string, agent: any, didjs_id: string): Promise<undefined | string> {
  const didjs_interface: IDL.InterfaceFactory = ({ IDL }) => IDL.Service({
    did_to_js: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
  });
  const didjs: ActorSubclass = Actor.createActor(didjs_interface, { agent, canisterId: didjs_id });
  const js: any = await didjs.did_to_js(candid_source);
  if (js === []) {
    return undefined;
  }
  return js[0];
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
