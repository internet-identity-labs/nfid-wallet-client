import { ActorMethod } from "@dfinity/agent";
import { Bytes, ethers, Signer, TypedDataDomain, TypedDataField } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { hashMessage, keccak256, resolveProperties, _TypedDataEncoder, hexlify } from "ethers/lib/utils";
import { joinSignature } from "@ethersproject/bytes";
import { serialize } from "@ethersproject/transactions";
import { UnsignedTransaction } from "ethers-ts";
import { SignTypedDataVersion, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { getPublicKey, signECDSA } from "../lambda/ecdsa";
import { DelegationIdentity } from "@dfinity/identity";

const ABI_721 = [
  "function setApprovalForAll(address operator, bool _approved)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function transfer(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function isApprovedForAll(address owner, address operator)"
];

export class EthWalletV2<T = Record<string, ActorMethod>> extends Signer {
  override provider?: Provider;
  readonly walletIdentity: DelegationIdentity;

  constructor(walletIdentity: DelegationIdentity, provider?: Provider) {
    super();
    this.provider = provider;
    this.walletIdentity = walletIdentity;
  }

  async getAddress(): Promise<string> {
    return getPublicKey(this.walletIdentity)
      .then(ethers.utils.computeAddress);
  }

  async signMessage(message: Bytes | string): Promise<string> {
    const keccakHash = hashMessage(message);
    return signECDSA(keccakHash, this.walletIdentity)
      .then(joinSignature);
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return resolveProperties(transaction).then((tx) => {
      if (tx.from != null) {
        delete tx.from;
      }
      const keccakHash = keccak256(serialize(<UnsignedTransaction>tx));
      return signECDSA(keccakHash, this.walletIdentity)
        .then(async signature => {
          return serialize(<UnsignedTransaction>tx, signature);
        });
    });
  }

  async signTypedData({
                        types,
                        primaryType,
                        domain,
                        message
                      }: TypedMessage<any>): Promise<string> {
    console.debug("signTypedData", { types, primaryType, domain, message });

    const typedDataHash = TypedDataUtils.eip712Hash(
      { types, primaryType, domain, message },
      SignTypedDataVersion.V4
    );
    return signECDSA(hexlify(typedDataHash), this.walletIdentity)
      .then(async signature => {
        return joinSignature(signature);
      });
  }

  async safeTransferFrom(to: string, contractAddress: string, tokenId: string) {
    const contract = new ethers.Contract(contractAddress, ABI_721, this.provider);
    const connectedWallet = contract.connect(this);
    return connectedWallet["safeTransferFrom"](this.getAddress(), to, tokenId);
  }

  async approve(to: string, contractAddress: string, tokenId: string) {
    const contract = new ethers.Contract(contractAddress, ABI_721, this.provider);
    const connectedWallet = contract.connect(this);
    return connectedWallet["approve"](to, tokenId);
  }

  async setApprovalForAll(operator: string, contractAddress: string, approved: boolean) {
    const contract = new ethers.Contract(contractAddress, ABI_721, this.provider);
    const connectedWallet = contract.connect(this);
    return connectedWallet["setApprovalForAll"](operator, approved);
  }

  async isApprovedForAll(owner: string, contractAddress: string, operator: string) {
    const contract = new ethers.Contract(contractAddress, ABI_721, this.provider);
    const connectedWallet = contract.connect(this);
    return connectedWallet["isApprovedForAll"](owner, operator);
  }

  connect(provider: Provider): Signer {
    this.provider = provider;
    return this;
  }

  async _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    throw new Error("We did not decide what to do with this for now. Please contact BE team if you face it (:");
  }

}
