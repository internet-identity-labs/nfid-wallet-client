import { HttpAgent, SignIdentity } from "@dfinity/agent"
import {
  CkETHMinterCanister,
  encodePrincipalToEthAddress,
} from "@dfinity/cketh"
import { Account } from "@dfinity/ledger-icp"
import { ApproveParams, IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { TransferArg } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger"
import { Principal } from "@dfinity/principal"
import {
  Contract,
  InfuraProvider,
  parseEther,
  TransactionRequest,
  type FeeData,
  type TransactionResponse,
} from "ethers"
import { agentBaseConfig } from "packages/integration/src/lib/actors"

import { transferICRC1 } from "@nfid/integration/token/icrc1"

import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import {
  Address,
  Balance,
  chainFusionSignerService,
} from "../bitcoin/services/chain-fusion-signer.service"
import { patronService } from "../bitcoin/services/patron.service"
import { CKETH_ABI } from "./cketh.constants"
import { getWalletDelegation } from "../facade/wallet"
import {
  MINTER_ADDRESS,
  CKETH_MINTER_CANISTER_ID,
  CKETH_NETWORK_FEE,
  INFURA_API_KEY,
  CHAIN_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { KEY_ETH_ADDRESS } from "packages/integration/src/lib/authentication/storage"

export type SendEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
}

export type CkEthToEthFee = {
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
  identityLabsFee: bigint
}

export type EthToCkEthFee = {
  gasUsed: bigint
  maxPriorityFeePerGas: bigint
  maxFeePerGas: bigint
  baseFeePerGas: bigint
  ethereumNetworkFee: bigint
  amountToReceive: bigint
  icpNetworkFee: bigint
}

export abstract class EVMTransactionService {
  protected provider: InfuraProvider

  constructor() {
    this.provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
  }

  public async getQuickAddress() {
    const { cachedValue } = await this.getAddressFromCache()

    if (cachedValue == null) {
      let identity = await getWalletDelegation()
      return this.getAddress(identity)
    } else {
      return cachedValue as string
    }
  }

  //get eth address from global identity
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = this.getAddressFromCache()

    if (cachedValue != null) {
      return cachedValue as string
    }
    await patronService.askToPayFor(identity)

    const address = await chainFusionSignerService.getEthAddress(identity)
    localStorage.setItem(key, address)
    return address
  }

  //get balance of eth address
  public async getBalance(address: Address): Promise<Balance> {
    return await this.provider.getBalance(address)
  }

  public async getQuickBalance(): Promise<Balance> {
    const { cachedValue } = await this.getAddressFromCache()

    if (!cachedValue) {
      throw Error("No ethereum address in a cache.")
    }

    return await this.getBalance(cachedValue as Address)
  }

  //retrieve fee data from provider
  private async getFeeData(): Promise<FeeData> {
    const feeData = await this.provider.getFeeData()
    return feeData
  }

  //estimate gas for transaction
  private async estimateGas({
    to,
    from,
    value,
    data,
  }: TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      value,
      from,
      data,
    })
  }

  //deposit eth to ckETH
  public async convertToCkEth(
    identity: SignIdentity,
    amount: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ) {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)

    let address = await this.getAddress(identity)

    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    let subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    let trs = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount) },
    )
    let nonce = await this.getTransactionCount(address)

    let trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: parseEther(amount),
      data: [trs.data],
      nonce: BigInt(nonce),
      gas: gas.gasUsed,
      max_priority_fee_per_gas: gas.maxPriorityFeePerGas,
      max_fee_per_gas: gas.maxFeePerGas,
      chain_id: CHAIN_ID,
    }
    let signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      trs_request,
    )
    let response = await this.sendTransaction(signedTransaction)
    return response
  }

  private getIdentityLabsFee(parsedAmount: bigint): bigint {
    return (parsedAmount * BigInt(875)) / BigInt(10000000000)
  }

  //convert ckETH to eth
  public async convertFromCkEth(
    address: Address,
    amount: string,
    identity: SignIdentity,
  ) {
    const parsedAmount = parseEther(amount)
    //we take 0.0000875% ckETH as fee
    let identityLabsFee: bigint = this.getIdentityLabsFee(parsedAmount)

    //Minimum amount 0.03 ckETH
    if (parsedAmount < BigInt(30000000000000000)) {
      throw new Error("The minimum amount for conversion is 0.03 ckETH")
    }

    await this.approveTransfer(
      CKETH_LEDGER_CANISTER_ID,
      CKETH_MINTER_CANISTER_ID,
      parsedAmount,
      identity,
    )

    let agent = new HttpAgent({
      ...agentBaseConfig,
      identity: identity,
    })

    let ckEthMinter = await CkETHMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKETH_MINTER_CANISTER_ID),
    })

    let result = await ckEthMinter.withdrawEth({
      address,
      amount: parsedAmount,
    })

    const transferArgs: TransferArg = {
      amount: identityLabsFee,
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET_CANISTER),
      },
    }

    transferICRC1(identity, CKETH_LEDGER_CANISTER_ID, transferArgs)

    return result
  }

  public async getSendEthFee(
    to: Address,
    from: Address,
    value: string,
  ): Promise<SendEthFee> {
    const gasUsed = await this.estimateGas({
      to,
      from,
      value: parseEther(value),
    })

    const feeData = await this.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()

    const ethereumNetworkFee = this.estimateTransaction(
      gasUsed,
      feeData.maxFeePerGas,
    )

    return {
      gasUsed,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
    }
  }

  public async getEthToCkEthFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<EthToCkEthFee> {
    const ckEthContract = new Contract(MINTER_ADDRESS, CKETH_ABI, this.provider)
    const fromAddress = await this.getAddress(identity)
    const principalHex = encodePrincipalToEthAddress(identity.getPrincipal())

    const subaccount =
      "0x0000000000000000000000000000000000000000000000000000000000000000"

    const txRequest = await ckEthContract.depositEth.populateTransaction(
      principalHex,
      subaccount,
      { value: parseEther(amount.toString()) },
    )

    const gasEstimate = await this.estimateGas({
      to: txRequest.to,
      from: fromAddress,
      value: txRequest.value,
      data: txRequest.data,
    })

    const feeData = await this.getFeeData()
    if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("getApproximateEthFee: Gas fee data is missing")
    }

    const baseFee = await this.getBaseFee()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)

    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      gasUsed: gasEstimate,
      baseFeePerGas: baseFee,
      ethereumNetworkFee,
      amountToReceive:
        parseEther(amount.toString()) - ethereumNetworkFee - CKETH_NETWORK_FEE,
      icpNetworkFee: CKETH_NETWORK_FEE,
    }
  }

  public async getCkEthToEthFee(
    to: string,
    amount: string,
  ): Promise<CkEthToEthFee> {
    const parsedAmount = parseEther(amount.toString())
    const identityLabsFee = this.getIdentityLabsFee(parsedAmount)
    const amountToReceive = parsedAmount - identityLabsFee - CKETH_NETWORK_FEE

    const gasEstimate = await this.estimateGas({
      to,
      value: parsedAmount,
    })

    const feeData = await this.provider.getFeeData()
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || BigInt(2_000_000_000)
    const maxFeePerGas =
      feeData.maxFeePerGas || maxPriorityFeePerGas + BigInt(5_000_000_000)

    const ethereumNetworkFee = this.estimateTransaction(
      gasEstimate,
      maxFeePerGas,
    )

    return {
      ethereumNetworkFee,
      amountToReceive,
      icpNetworkFee: CKETH_NETWORK_FEE * BigInt(2),
      identityLabsFee,
    }
  }

  private estimateTransaction(gas: bigint, maxFeePerGas: bigint): bigint {
    return gas * maxFeePerGas
  }

  //transfer eth
  public async sendEthTransaction(
    identity: SignIdentity,
    to: Address,
    value: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ): Promise<TransactionResponse> {
    const address = await this.getAddress(identity)

    const nonce = await this.getTransactionCount(address)

    let request: EthSignTransactionRequest = {
      chain_id: CHAIN_ID,
      to: to,
      value: parseEther(value),
      data: [],
      nonce: BigInt(nonce),
      gas: gas?.gasUsed,
      max_priority_fee_per_gas: gas?.maxPriorityFeePerGas,
      max_fee_per_gas: gas?.maxFeePerGas,
    }

    let signedTransaction = await chainFusionSignerService.ethSignTransaction(
      identity,
      request,
    )

    return await this.sendTransaction(signedTransaction)
  }

  private getAddressFromCache() {
    const cachedValue = localStorage.getItem(KEY_ETH_ADDRESS)

    return {
      cachedValue,
      key: KEY_ETH_ADDRESS,
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
      const response =
        await this.provider.broadcastTransaction(signedTransaction)
      await response.wait()
      return response
    } catch (e) {
      throw e
    }
  }
}
