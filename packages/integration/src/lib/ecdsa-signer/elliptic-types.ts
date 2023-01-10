declare module "bn.js" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace BN {
    type Endianness = "le" | "be"
    type IPrimeName = "k256" | "p224" | "p192" | "p25519"

    interface MPrime {
      name: string
      p: BN
      n: number
      k: BN
    }

    interface ReductionContext {
      m: number
      prime: MPrime

      [key: string]: any
    }
  }

  export class BN {
    constructor(
      number: number | string | number[] | Uint8Array | Buffer | BN,
      base?: number | "hex",
      endian?: BN.Endianness,
    )
    constructor(
      number: number | string | number[] | Uint8Array | Buffer | BN,
      endian?: BN.Endianness,
    )

    add(other: BN): BN

    sub(other: BN): BN

    div(other: BN): BN

    mod(other: BN): BN

    mul(other: BN): BN

    pow(other: BN): BN

    maskn(other: number): BN

    eq(other: BN): boolean

    lt(other: BN): boolean

    lte(other: BN): boolean

    gt(other: BN): boolean

    gte(other: BN): boolean

    isZero(): boolean

    toTwos(other: number): BN

    fromTwos(other: number): BN

    toString(radix: number): string

    toNumber(): number

    toArray(endian: string, width: number): Uint8Array

    encode(encoding: string, compact: boolean): Uint8Array
  }
}

declare module "elliptic" {
  import { BN } from "bn.js"
  export type BasicSignature = {
    r: Uint8Array
    s: Uint8Array
  }

  export type Signature = {
    r: BN
    s: BN
    recoveryParam: number
  }

  interface Point {
    add(point: Point): Point

    encodeCompressed(enc: string): string
  }

  interface KeyPair {
    sign(message: Uint8Array, options: { canonical?: boolean }): Signature

    getPublic(compressed: boolean, encoding?: string): string

    getPublic(): BN

    getPrivate(encoding?: string): string

    encode(encoding: string, compressed: boolean): string

    derive(publicKey: BN): BN

    pub: Point
    priv: BN
  }

  export class ec {
    constructor(curveName: string)

    n: BN

    genKeyPair(): KeyPair

    keyFromPrivate(privateKey: Uint8Array): KeyPair

    recoverPubKey(
      data: Uint8Array,
      signature: BasicSignature,
      recoveryParam: number,
    ): KeyPair
  }
}
