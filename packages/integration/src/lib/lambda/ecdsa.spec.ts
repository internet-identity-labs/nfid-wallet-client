/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";
import { ecdsaSigner, generateDelegationIdentity, replaceActorIdentity } from "@nfid/integration";

import { registerECDSA, signECDSA } from "./ecdsa";
import { arrayify, hashMessage } from "ethers/lib/utils";
import { ethers } from "ethers";

describe("123 suite", () => {
  jest.setTimeout(50000);

  describe("lambdaECDSA", () => {
    it("register ecdsa", async function() {
      const mockedIdentity = Ed25519KeyIdentity.generate();
      const delegationIdentity: DelegationIdentity =
        await generateDelegationIdentity(mockedIdentity);
       await replaceActorIdentity(ecdsaSigner, delegationIdentity);
      const publicKey = await registerECDSA(delegationIdentity);
      const keccak = hashMessage("test_message")
      const signature = await signECDSA(keccak, delegationIdentity)
      const digestBytes = arrayify(keccak)
      const pk = ethers.utils.recoverPublicKey(digestBytes, signature)
      // expect(pk).toEqual(publicKey)
      console.log(publicKey);
      console.log(pk);
    });


  });

});
