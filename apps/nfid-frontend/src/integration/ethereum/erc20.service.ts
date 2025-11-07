import { CHAIN_ID, INFURA_API_KEY } from "@nfid/integration/token/constants"
import { InfuraProvider, parseEther, Interface, AbiCoder } from "ethers"
import { Address } from "../bitcoin/services/chain-fusion-signer.service"
import { chainFusionSignerService } from "../bitcoin/services/chain-fusion-signer.service"
import { EthSignTransactionRequest } from "../bitcoin/idl/chain-fusion-signer.d"
import { SignIdentity } from "@dfinity/agent"
import { Contract } from "ethers"
import { TransactionResponse } from "ethers"
import { ethereumService } from "./ethereum.service"

export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
]

// Multicall3 contract address (works on all EVM chains)
// Reference: https://medium.com/coinmonks/the-best-method-for-bulk-fetching-erc20-token-balances-99da12f4d839
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"

const MULTICALL3_ABI = [
  "function aggregate((address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, (address target, bytes callData)[] calls) payable returns (uint256 blockNumber, uint256 blockHash, (bool success, bytes returnData)[] returnData)",
]

export const ZERO = BigInt(0)

export class Erc20Service {
  private provider: InfuraProvider

  constructor() {
    this.provider = new InfuraProvider(CHAIN_ID, INFURA_API_KEY)
  }

  /**
   * Get ERC20 token balances using Multicall3 contract - most efficient method
   * Reference: https://medium.com/coinmonks/the-best-method-for-bulk-fetching-erc20-token-balances-99da12f4d839
   *
   * This method uses Multicall3 to fetch all balances in a single request,
   * which is much faster and more cost-efficient than individual calls.
   *
   * @param address - Wallet address to check balances for
   * @param contractAddresses - Array of ERC20 token contract addresses
   * @returns Array of balance objects with contractAddress, balance, and address
   */
  public async getMultipleTokenBalances(
    address: string,
    contractAddresses: string[],
  ) {
    if (contractAddresses.length === 0) {
      return []
    }

    try {
      // Use Multicall3 to get all balances in a single request
      const multicallInterface = new Interface(MULTICALL3_ABI)
      const erc20Interface = new Interface(ERC20_ABI)

      // Encode balanceOf call for each token
      const balanceOfData = erc20Interface.encodeFunctionData("balanceOf", [
        address,
      ])

      // Prepare calls for multicall - one call per token contract
      const calls = contractAddresses.map((contractAddress) => ({
        target: contractAddress,
        callData: balanceOfData,
      }))

      // Encode the aggregate function call
      const aggregateData = multicallInterface.encodeFunctionData("aggregate", [
        calls,
      ])

      // Execute all calls in one request using provider.call (read-only)
      // This is much more efficient than individual calls
      const result = await this.provider.call({
        to: MULTICALL3_ADDRESS,
        data: aggregateData,
      })

      // Decode the result
      const [_, returnData] = multicallInterface.decodeFunctionResult(
        "aggregate",
        result,
      )

      // Decode results
      const abiCoder = new AbiCoder()
      return contractAddresses.map((contractAddress, index) => {
        try {
          // Decode the uint256 balance from the return data
          const balance = abiCoder.decode(["uint256"], returnData[index])[0]
          return {
            contractAddress,
            balance: balance.toString(),
            address,
          }
        } catch (error) {
          console.error(
            `Error decoding balance for contract ${contractAddress}:`,
            error,
          )
          return {
            contractAddress,
            balance: "0",
            address,
            error: error instanceof Error ? error.message : "Decode error",
          }
        }
      })
    } catch (error) {
      console.error("Multicall error, falling back to individual calls:", error)
      // Fallback to individual calls if multicall fails
      return this.getMultipleTokenBalancesFallback(address, contractAddresses)
    }
  }

  /**
   * Fallback method: Get balances using individual calls
   * Used when Multicall3 fails or is unavailable
   */
  private async getMultipleTokenBalancesFallback(
    address: string,
    contractAddresses: string[],
  ) {
    const balancePromises = contractAddresses.map(async (contractAddress) => {
      try {
        const erc20Contract = new Contract(
          contractAddress,
          ERC20_ABI,
          this.provider,
        )
        const balance = await erc20Contract.balanceOf(address)
        return {
          contractAddress,
          balance: balance.toString(),
          address,
        }
      } catch (error) {
        console.error(
          `Error getting balance for contract ${contractAddress}:`,
          error,
        )
        return {
          contractAddress,
          balance: "0",
          address,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })

    const results = await Promise.allSettled(balancePromises)
    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        return {
          contractAddress: contractAddresses[index],
          balance: "0",
          address,
          error: result.reason?.message || "Failed to fetch balance",
        }
      }
    })
  }

  getFeeData = async ({
    contractAddress,
    to,
    from,
    amount,
  }: {
    contractAddress: Address
    from: Address
    to: Address
    amount: bigint
  }): Promise<bigint> => {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )

    return erc20Contract.transfer.estimateGas(to, amount, { from })
  }

  public async estimateERC20Gas(
    contractAddress: Address,
    to: Address,
    amount: bigint,
  ): Promise<{
    gasUsed: bigint
    maxPriorityFeePerGas: bigint
    maxFeePerGas: bigint
    baseFeePerGas: bigint
  }> {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )

    const gas = erc20Contract.transfer.estimateGas(to, amount)
    const feeData = this.provider.getFeeData()
    const block = this.provider.getBlock("latest")

    return Promise.all([gas, feeData, block]).then(([gas, feeData, block]) => {
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error("estimateERC20Gas: Gas fee data is missing")
      }
      return {
        gasUsed: gas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        baseFeePerGas: block?.baseFeePerGas ?? BigInt(0),
      }
    })
  }

  public async sendErc20Transaction(
    identity: SignIdentity,
    contractAddress: Address,
    to: Address,
    value: string,
    gas: {
      gasUsed: bigint
      maxPriorityFeePerGas: bigint
      maxFeePerGas: bigint
      baseFeePerGas: bigint
    },
  ): Promise<TransactionResponse> {
    const erc20Contract = new Contract(
      contractAddress,
      ERC20_ABI,
      this.provider,
    )
    const fromAddress = await ethereumService.getAddress(identity)
    const nonce = await ethereumService.getTransactionCount(fromAddress)
    const valueBigInt = parseEther(value)
    let trs = await erc20Contract.transfer.populateTransaction(to, valueBigInt)

    let trs_request: EthSignTransactionRequest = {
      to: trs.to,
      value: valueBigInt,
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
    console.debug("signedTransaction", signedTransaction)
    let response = await this.sendTransaction(signedTransaction)
    console.debug("response", response)
    return response
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

export const erc20Service = new Erc20Service()
