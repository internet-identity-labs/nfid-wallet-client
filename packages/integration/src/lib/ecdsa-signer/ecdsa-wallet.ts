import {ActorMethod} from "@dfinity/agent"
import {Bytes, ethers, Signer, TypedDataDomain, TypedDataField} from "ethers"
import {Provider, TransactionRequest} from "@ethersproject/abstract-provider"
import {getEcdsaPublicKey, signEcdsaMessage} from "./index"
import {arrayify, hashMessage, keccak256, resolveProperties, splitSignature} from "ethers/lib/utils"
import {hexZeroPad, joinSignature} from "@ethersproject/bytes"
import {serialize} from "@ethersproject/transactions"
import {UnsignedTransaction} from "ethers-ts"
import BN = require("bn.js")
import {TypedDataSigner} from "@ethersproject/abstract-signer/src.ts";

const ABI_721 = [
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transfer(address from, address to, uint256 tokenId)'
];

export class EthWallet<T = Record<string, ActorMethod>> extends Signer implements TypedDataSigner {
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
    const keccakHash = hashMessage(message)
    const messageHashAsBytes = arrayify(keccakHash)
    return signEcdsaMessage([...messageHashAsBytes])
      .then(signature => {
        const ethersSignature = this._splitSignature(signature, messageHashAsBytes)
        return joinSignature(ethersSignature)
      })
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return resolveProperties(transaction).then((tx) => {
      if (tx.from != null) {
        delete tx.from
      }
      const keccakHash = keccak256(serialize(<UnsignedTransaction>tx))
      const messageHashAsBytes = arrayify(keccakHash)
      return signEcdsaMessage([...messageHashAsBytes])
        .then(signature => {
          const ethersSignature = this._splitSignature(signature, messageHashAsBytes)
          return serialize(<UnsignedTransaction>tx, ethersSignature)
        })
    })
  }

  async safeTransferFrom(to: string, contractAddress: string, tokenId: string) {
    const contract = new ethers.Contract(contractAddress, ABI_721, this.provider)
    const connectedWallet = contract.connect(this)
    return connectedWallet["safeTransferFrom"](this.getAddress(), to, tokenId);
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

  _splitSignature(signature: Array<number>, digestBytes: Uint8Array) {
    const elliptic_signature = this._toEllipticSignature(signature)
    let ethersSignature = splitSignature({
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

  async _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
   throw new Error("We did not decide what to do with this for now. Please contact BE team if you face it (:")
  }

}
