import {DelegationChain, DelegationIdentity, Ed25519KeyIdentity,} from "@dfinity/identity"
import {Principal} from "@dfinity/principal"

import {ONE_HOUR_IN_MS} from "@nfid/config"
import {
  DelegationType,
  getAnonymousDelegate,
  GLOBAL_ORIGIN,
  ic,
  icSigner,
  replaceActorIdentity,
} from "@nfid/integration"

import {deleteFromStorage} from "./domain-key-repository"
import {DerEncodedPublicKey, PublicKey} from "@dfinity/agent";
import {createDecipheriv, Encoding} from "crypto";
import {getAnonSalt, getSalt} from "./storage.service";


export enum Chain {
  IC = "IC",
}

export async function getAnonymousDelegationThroughLambda(
  domain: string,
  sessionKey: Uint8Array,
  identity: DelegationIdentity,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
) {
  const uniqueString = await getAnonSalt(domain)
  const seed = hexStringToUint8Array(uniqueString)
  const anonymousIdentity = Ed25519KeyIdentity.generate(seed);
  const chain = await DelegationChain.create(
    anonymousIdentity,
    new DerPublicKey(sessionKey),
    new Date(Date.now() + maxTimeToLive),
  );
  await deleteFromStorage(domain)
  return chain
}

export async function fetchLambdaPublicKey(chain: Chain): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const response = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chain }),
  })

  if (!response.ok) throw new Error(await response.text())
  return (await response.json()).public_key
}

export async function oldFlowGlobalKeysFromLambda(
  identity: DelegationIdentity,
  targets: string[],
  sessionPublicKey: Uint8Array,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
) {
  await replaceActorIdentity(icSigner, identity)
  const encryptedKP = await icSigner.get_kp()
  const uniqueString = await getSalt()
  const privateKey = decrypt(encryptedKP.key_pair[0]!.private_key_encrypted, "utf8", uniqueString)
  const publicKey = encryptedKP.key_pair[0]!.public_key;
  const parsedKP = Ed25519KeyIdentity.fromParsedJson([publicKey, privateKey])
  const key = new DerPublicKey(sessionPublicKey);
  return await DelegationChain.create(
    parsedKP,
    key,
    new Date(Date.now() + maxTimeToLive),
    {
      targets: targets.map((x) => Principal.fromText(x))
    },
  )
}

export async function getLambdaPublicKey(
  identity: DelegationIdentity,
  origin = GLOBAL_ORIGIN,
  type = DelegationType.GLOBAL,
  root: string | undefined,
) {
  if (type === DelegationType.GLOBAL) {
    const signer = icSigner
    await replaceActorIdentity(signer, identity)
    if (!root) {
      throw Error("The root account cannot be found.")
    }
    const response = (await signer.get_public_key(root)) as string[]
    let publicKey
    if (response.length === 0) {
     throw Error("No public key found")
    } else {
      publicKey = response[0]
    }
    const publicDelegation = Ed25519KeyIdentity.fromParsedJson([publicKey, "0"])
    const principal = Principal.selfAuthenticating(
      new Uint8Array(publicDelegation.getPublicKey().toDer()),
    )
    return principal.toText()
  } else {
    const sessionKey = Ed25519KeyIdentity.generate()
    const anonymousDelegation = await getAnonymousDelegate(
      Array.from(new Uint8Array(sessionKey.getPublicKey().toDer())) as any,
      identity,
      origin,
      undefined,
    )
    return Principal.selfAuthenticating(
      new Uint8Array(anonymousDelegation.publicKey),
    ).toText()
  }
}


export function fromHexString(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes.buffer
}

function hexStringToUint8Array(hexString: string) {
  const cleanedString = hexString.replace(/[^0-9a-f]/gi, "").toLowerCase();
  const bytePairs = cleanedString.match(/.{1,2}/g);
  const byteValues = bytePairs!.map((bytePair) => parseInt(bytePair, 16));
  return new Uint8Array(byteValues);
}

function decrypt (encrypted: string, encoding: Encoding, key: string) {
  const secret = Buffer.from(key, "hex");
  const cipher = createDecipheriv("aes-256-ecb", secret, "");
  let decryptedString = cipher.update(encrypted, "hex", encoding);
  decryptedString += cipher.final(encoding);
  return decryptedString;
}

export class DerPublicKey implements PublicKey {
  der;
  constructor(a: any) {
    this.der = a;
  }
  toDer(): DerEncodedPublicKey {
    return this.der;
  }
}
