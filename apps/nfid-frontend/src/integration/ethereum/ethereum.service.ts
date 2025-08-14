import { HttpAgent, SignIdentity } from "@dfinity/agent"
import {
  CkETHMinterCanister,
  encodePrincipalToEthAddress,
} from "@dfinity/cketh"
import { Account } from "@dfinity/ledger-icp"
import { ApproveParams, IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import {
  Contract,
  InfuraProvider,
  parseEther,
  type FeeData,
  type TransactionResponse,
} from "ethers"
import { agentBaseConfig } from "packages/integration/src/lib/actors"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import {
  Address,
  Balance,
  chainFusionSignerService,
} from "../bitcoin/services/chain-fusion-signer.service"
import { patronService } from "../bitcoin/services/patron.service"
import { CKETH_ABI, CKETH_FEE } from "./cketh.constants"

const INFURA_API_KEY = "010993c30ae14b2b94ff239547b6ebbe"

//MAINNET
// let address = "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68"
// let chainId = BigInt(1)
// let minterCanisterId = "ss2fx-dyaaa-aaaar-qacoq-cai"
// export  let ledgerCanisterId = "ss2fx-dyaaa-aaaar-qacoq-cai"

//TESTNET
let chainId = BigInt(11155111)
export const MINTER_ADDRESS = "0x2D39863d30716aaf2B7fFFd85Dd03Dda2BFC2E38"
export const MINTER_CANISTER_ID = "jzenf-aiaaa-aaaar-qaa7q-cai"
export const LEDGER_CANISTER_ID = "apia6-jaaaa-aaaar-qabma-cai"

export class EthereumService {
  private provider: InfuraProvider

  constructor() {
    this.provider = new InfuraProvider(chainId, INFURA_API_KEY)
  }

  //get eth address from global identity
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = await this.getAddressFromCache(
      identity.getPrincipal().toText(),
    )

    if (cachedValue != null) {
      return cachedValue as string
    }
    await patronService.askToPayFor(identity)

    const address = await chainFusionSignerService.getEthAddress(identity)
    await authStorage.set(key, address)
    return address
  }

  //get balance of eth address
  public async getBalance(address: Address): Promise<Balance> {
    return await this.provider.getBalance(address)
  }

  public async getQuickBalance(principal: Principal): Promise<Balance> {
    const { cachedValue } = await this.getAddressFromCache(principal.toText())

    if (!cachedValue) {
      throw Error("No ethereum address in a cache.")
    }

    return await this.getBalance(cachedValue as Address)
  }

  //retrieve fee data from provider
  private async getFee(): Promise<FeeData> {
    const feeData = await this.provider.getFeeData()
    return feeData
  }

  //estimate gas for transaction
  private async estimateGas(address: Address, amount: string): Promise<bigint> {
    return await this.provider.estimateGas({
      to: address,
      value: parseEther(amount),
    })
  }

  //deposit eth to ckETH
  public async depositEth(identity: SignIdentity, amount: bigint) {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)

    let address = await this.getAddress(identity)

    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    let subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    let trs = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: amount },
    )
    const feeData = await this.provider.getFeeData()
    let nonce = await this.getTransactionCount(address)

    const max_priority_fee_per_gas =
      feeData.maxPriorityFeePerGas || BigInt(2000000000)
    const max_fee_per_gas =
      feeData.maxFeePerGas || max_priority_fee_per_gas + BigInt(5000000000)
    let trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: amount,
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: trs.gasPrice || CKETH_FEE,
      max_priority_fee_per_gas: max_priority_fee_per_gas,
      max_fee_per_gas: max_fee_per_gas,
      chain_id: chainId,
    }
    let signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    let response = await this.sendTransaction(signedTransaction)
    return response
  }

  //convert ckETH to eth
  public async convertCkETHToEth(
    address: Address,
    amount: bigint,
    identity: SignIdentity,
  ) {
    //Minimum amount 0.03 ckETH
    if (amount < BigInt(30000000000000000)) {
      throw new Error("Minimum amount is 0.03 ckETH")
    }

    await this.approveTransfer(
      LEDGER_CANISTER_ID,
      MINTER_CANISTER_ID,
      amount,
      identity,
    )

    let agent = new HttpAgent({
      ...agentBaseConfig,
      identity: identity,
    })

    let ckEthMinter = await CkETHMinterCanister.create({
      agent,
      canisterId: Principal.fromText(MINTER_CANISTER_ID),
    })

    let result = await ckEthMinter.withdrawEth({ address, amount })

    return result
  }

  public async getApproximateEthFee(to: Address, value: string) {
    const feeData = await this.getFee()

    if (
      feeData.gasPrice === null ||
      feeData.maxFeePerGas === null ||
      feeData.maxPriorityFeePerGas === null
    ) {
      throw new Error("sendEthTransaction Gas error")
    }

    const [gasUsed, baseFee] = await Promise.all([
      this.estimateGas(to, value),
      this.getBaseFee(),
    ])

    return gasUsed * (baseFee + feeData.maxPriorityFeePerGas)
  }

  //transfer eth
  public async sendEthTransaction(
    identity: SignIdentity,
    to: Address,
    value: string,
  ): Promise<TransactionResponse> {
    const address = await this.getAddress(identity)

    const [nonce, gasLimit, feeData] = await Promise.all([
      this.getTransactionCount(address),
      this.estimateGas(to, value),
      this.getFee(),
    ])

    if (
      feeData.gasPrice === null ||
      feeData.maxFeePerGas === null ||
      feeData.maxPriorityFeePerGas === null
    )
      throw new Error("sendEthTransaction Gas error")

    let request: EthSignTransactionRequest = {
      chain_id: chainId,
      to: to,
      value: parseEther(value),
      data: [],
      nonce: BigInt(nonce),
      gas: gasLimit,
      max_priority_fee_per_gas: feeData.maxPriorityFeePerGas,
      max_fee_per_gas: feeData.maxFeePerGas,
    }

    let signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )

    return await this.sendTransaction(signedTransaction)
  }

  private async getAddressFromCache(principal: string) {
    const key = `eth-address-${principal}`
    const cachedValue = await authStorage.get(key)

    return {
      cachedValue,
      key,
    }
  }

  private async approveTransfer(
    ledgerCanisterId: string,
    minterCanisterId: string,
    amount: bigint,
    identity: SignIdentity,
  ): Promise<bigint> {
    let ledger = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(ledgerCanisterId),
      agent: new HttpAgent({
        ...agentBaseConfig,
        identity: identity,
      }),
    })
    const spender: Account = {
      owner: Principal.fromText(minterCanisterId),
      subaccount: [],
    }
    let params: ApproveParams = {
      spender,
      amount,
    }
    const icrc2approve = await ledger.approve(params)

    return BigInt(icrc2approve)
  }

  public async getTransactionCount(address: Address): Promise<number> {
    const transactionCount = await this.provider.getTransactionCount(address)
    return transactionCount
  }

  private async getBaseFee() {
    const block = await this.provider.getBlock("latest")
    return block?.baseFeePerGas ?? BigInt(0)
  }

  private async sendTransaction(
    signedTransaction: string,
  ): Promise<TransactionResponse> {
    try {
      const response = await this.provider.broadcastTransaction(
        signedTransaction,
      )
      await response.wait()
      return response
    } catch (e) {
      throw e
    }
  }
}

export const ethereumService = new EthereumService()
