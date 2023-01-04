import { ActorMethod } from "@dfinity/agent"
import { Bytes, ethers, Signer } from "ethers"
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider"
import { getEcdsaPublicKey, signEcdsaMessage } from "./index"
import { arrayify, hashMessage, keccak256, resolveProperties, splitSignature } from "ethers/lib/utils"
import { hexZeroPad, joinSignature } from "@ethersproject/bytes"
import { serialize } from "@ethersproject/transactions"
import { UnsignedTransaction } from "ethers-ts"
import { BN } from "bn.js"


export class EthWallet<T = Record<string, ActorMethod>> extends Signer {
  override provider?: Provider
  private address?: string

  constructor(provider?: Provider) {
    super()
    this.provider = provider
  }

  async getAddress(): Promise<string> {
    if (typeof this.address !== "undefined") {
      return this.address
    }
    return getEcdsaPublicKey()
      .then(pk => {
        this.address = ethers.utils.computeAddress(pk)
        return this.address
      })
  }

  async signMessage(message: Bytes | string): Promise<string> {
    const keccak = hashMessage(message)
    const digestBytes = arrayify(keccak)
    return signEcdsaMessage([...digestBytes])
      .then(signature => {
        const ethersSignature = this._splitSignature(signature, digestBytes)
        return joinSignature(ethersSignature)
      })
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return resolveProperties(transaction).then((tx) => {
      if (tx.from != null) {
        delete tx.from
      }
      const keccak = keccak256(serialize(<UnsignedTransaction>tx))
      const digestBytes = arrayify(keccak)
      return signEcdsaMessage([...digestBytes])
        .then(signature => {
          const ethersSignature = this._splitSignature(signature, digestBytes)
          return serialize(<UnsignedTransaction>tx, ethersSignature)
        })
    })
  }

  connect(provider: Provider): Signer {
    this.provider = provider
    return this
  }

  _toEllipticSignature(signature: Array<number>) {
    const bytes: Uint8Array = arrayify(signature)
    let v = 27 + (bytes[32] >> 7)
    // Allow a recid to be used as the v
    if (v < 27) {
      if (v === 0 || v === 1) {
        v += 27
      }
    }
    // Compute recoveryParam from v
    const recoveryParam: number = 1 - (v % 2)
    return {
      r: new BN(new Uint8Array(signature.slice(0, 32))),
      recoveryParam: recoveryParam,
      s: new BN(new Uint8Array(signature.slice(32, 64))),
    }
  }

  _splitSignature(signature: Array<number>, digestBytes: Uint8Array){
    const elliptic_signature = this._toEllipticSignature(signature)
    let  ethersSignature = splitSignature({
      recoveryParam: elliptic_signature.recoveryParam,
      r: hexZeroPad("0x" + elliptic_signature.r.toString(16), 32),
      s: hexZeroPad("0x" + elliptic_signature.s.toString(16), 32),
    })
    const address = ethers.utils.recoverAddress([...digestBytes], ethersSignature)
    const isEqualAddress = address === this.address
    // according to EIP-2098 we need to get recovery param from the first byte of s
    // but it does not work for some reasons.
    // With this workaround we can try to recover address with different yParity
    // sc-5902
    if (!isEqualAddress) {
      ethersSignature = splitSignature({
        recoveryParam: 1 - (ethersSignature.recoveryParam % 2),
        r: hexZeroPad("0x" + elliptic_signature.r.toString(16), 32),
        s: hexZeroPad("0x" + elliptic_signature.s.toString(16), 32),
      })
    }
    return ethersSignature
  }

}
